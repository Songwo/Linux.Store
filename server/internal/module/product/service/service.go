package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"strings"
	"time"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/model"
	productdto "devstore/server/internal/module/product/dto"
	productrepo "devstore/server/internal/module/product/repository"
	"github.com/redis/go-redis/v9"
)

const (
	productCacheVersionKey = "devstore:prod:product:cache:version"
	productListCacheTTL    = 20 * time.Second
	productDetailCacheTTL  = 20 * time.Second
)

type Service struct {
	repo  *productrepo.Repository
	redis *redis.Client
}

func New(repo *productrepo.Repository, redisClient *redis.Client) *Service {
	return &Service{repo: repo, redis: redisClient}
}

func (s *Service) ListCategories(ctx context.Context) ([]model.Category, *apperr.AppError) {
	items, err := s.repo.ListCategories(ctx)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load categories failed", err)
	}
	return items, nil
}

func (s *Service) ListProducts(ctx context.Context, query productdto.ProductListQuery, admin bool) (*productdto.ProductListResponse, *apperr.AppError) {
	cacheKey := ""
	if !admin {
		cacheKey = s.buildProductListCacheKey(ctx, query)
		var cached productdto.ProductListResponse
		if s.loadCache(ctx, cacheKey, &cached) {
			return &cached, nil
		}
	}

	rows, total, err := s.repo.ListProducts(ctx, query, admin)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load products failed", err)
	}
	list := make([]productdto.ProductItem, 0, len(rows))
	for _, row := range rows {
		list = append(list, toProductItem(row))
	}
	page := query.Page
	if page <= 0 {
		page = 1
	}
	pageSize := query.PageSize
	if pageSize <= 0 || pageSize > 50 {
		pageSize = 10
	}
	resp := &productdto.ProductListResponse{List: list, Total: total, Page: page, PageSize: pageSize}
	if !admin {
		s.saveCache(ctx, cacheKey, resp, productListCacheTTL)
	}
	return resp, nil
}

func (s *Service) GetProductDetail(ctx context.Context, id uint64) (map[string]interface{}, *apperr.AppError) {
	cacheKey := s.buildProductDetailCacheKey(ctx, id)
	var cached map[string]interface{}
	if s.loadCache(ctx, cacheKey, &cached) {
		_ = s.repo.IncreaseViewCount(ctx, id)
		bumpProductViewCount(cached)
		return cached, nil
	}

	product, err := s.repo.GetProductByID(ctx, id)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeNotFound, "product not found", err)
	}
	_ = s.repo.IncreaseViewCount(ctx, id)
	skus, err := s.repo.ListSKUs(ctx, id)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load skus failed", err)
	}
	images, err := s.repo.ListImages(ctx, id)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load images failed", err)
	}
	related, err := s.repo.ListRelated(ctx, product.CategoryID, product.ID)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load related products failed", err)
	}
	gallery := make([]string, 0, len(images)+1)
	if product.Cover != "" {
		gallery = append(gallery, product.Cover)
	}
	for _, image := range images {
		if image.ImageURL != "" {
			gallery = append(gallery, image.ImageURL)
		}
	}
	tags := parseTags(product)
	relatedItems := make([]productdto.ProductItem, 0, len(related))
	for _, item := range related {
		relatedItems = append(relatedItems, toProductItem(item))
	}
	result := map[string]interface{}{
		"product": map[string]interface{}{
			"id":             product.ID,
			"category_id":    product.CategoryID,
			"category_name":  product.CategoryName,
			"default_sku_id": product.DefaultSKUID,
			"name":           product.Name,
			"subtitle":       product.Subtitle,
			"type":           product.Type,
			"cover":          product.Cover,
			"gallery":        gallery,
			"description":    product.Description,
			"price":          product.Price,
			"origin_price":   product.OriginPrice,
			"rating":         product.Rating,
			"review_count":   product.ReviewCount,
			"points_price":   product.PointsPrice,
			"stock":          product.Stock,
			"sales_count":    product.SalesCount,
			"view_count":     product.ViewCount + 1,
			"limit_per_user": product.LimitPerUser,
			"status":         product.Status,
			"is_hot":         product.IsHot,
			"is_recommend":   product.IsRecommend,
			"tags":           tags,
			"purchase_note":  "虚拟商品支付成功后自动发货，可在订单详情查看交付内容。",
			"delivery_note":  "默认自动发货，若库存异常将由管理员补发。",
			"service_note":   "下单前请确认账号信息，虚拟商品一经发货不支持无理由退款。",
		},
		"skus":             skus,
		"related_products": relatedItems,
	}

	for _, sku := range skus {
		if sInfo, err := s.repo.GetActiveSeckillBySKU(ctx, sku.ID); err == nil && sInfo != nil {
			result["seckill_info"] = sInfo
			break
		}
	}

	s.saveCache(ctx, cacheKey, result, productDetailCacheTTL)
	return result, nil
}

func (s *Service) CreateProduct(ctx context.Context, req productdto.AdminProductCreateRequest) (*productdto.ProductItem, *apperr.AppError) {
	product := &model.Product{CategoryID: req.CategoryID, Name: req.Name, Subtitle: req.Subtitle, Type: req.Type, Status: normalizeStatus(req.Status), Cover: req.Cover, Description: req.Description, Price: req.Price, OriginPrice: req.OriginPrice, PointsPrice: req.PointsPrice, Stock: req.Stock, LockStock: 0, LimitPerUser: req.LimitPerUser, IsHot: req.IsHot, IsRecommend: req.IsRecommend}
	productSKU := &model.ProductSKU{SKUCode: fmt.Sprintf("SKU-%d", time.Now().UnixNano()), Title: req.Name, Price: req.Price, PointsPrice: req.PointsPrice, Stock: req.Stock, LockStock: 0, Status: product.Status}
	inventory := &model.Inventory{TotalStock: req.Stock, AvailableStock: req.Stock, ReservedStock: 0, Version: 0}
	if err := s.repo.CreateProduct(ctx, product, productSKU, inventory); err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "create product failed", err)
	}
	s.bumpCacheVersion(ctx)
	item := productdto.ProductItem{ID: product.ID, CategoryID: product.CategoryID, DefaultSKUID: productSKU.ID, Name: product.Name, Subtitle: product.Subtitle, Type: product.Type, Cover: product.Cover, Price: product.Price, OriginPrice: product.OriginPrice, PointsPrice: product.PointsPrice, Stock: product.Stock, Status: product.Status, IsHot: product.IsHot, IsRecommend: product.IsRecommend, SalesCount: product.SalesCount, ViewCount: product.ViewCount}
	return &item, nil
}

func (s *Service) UpdateProduct(ctx context.Context, id uint64, req productdto.AdminProductUpdateRequest) (*productdto.ProductItem, *apperr.AppError) {
	updates := map[string]interface{}{
		"category_id":    req.CategoryID,
		"name":           req.Name,
		"subtitle":       req.Subtitle,
		"type":           req.Type,
		"cover":          req.Cover,
		"description":    req.Description,
		"price":          req.Price,
		"origin_price":   req.OriginPrice,
		"points_price":   req.PointsPrice,
		"stock":          req.Stock,
		"limit_per_user": req.LimitPerUser,
		"status":         normalizeStatus(req.Status),
		"is_hot":         req.IsHot,
		"is_recommend":   req.IsRecommend,
	}
	if err := s.repo.UpdateProduct(ctx, id, updates); err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "update product failed", err)
	}
	s.bumpCacheVersion(ctx)
	row, err := s.repo.GetProductByID(ctx, id)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeNotFound, "product not found", err)
	}
	item := toProductItem(*row)
	return &item, nil
}

func toProductItem(row productrepo.ProductWithCategory) productdto.ProductItem {
	return productdto.ProductItem{ID: row.ID, CategoryID: row.CategoryID, CategoryName: row.CategoryName, DefaultSKUID: row.DefaultSKUID, Name: row.Name, Subtitle: row.Subtitle, Type: row.Type, Cover: row.Cover, Price: row.Price, OriginPrice: row.OriginPrice, Rating: row.Rating, ReviewCount: row.ReviewCount, PointsPrice: row.PointsPrice, Stock: row.Stock, Status: row.Status, IsHot: row.IsHot, IsRecommend: row.IsRecommend, SalesCount: row.SalesCount, ViewCount: row.ViewCount}
}

func normalizeStatus(status int8) int8 {
	if status == 0 {
		return 0
	}
	return 1
}

func parseTags(product *productrepo.ProductWithCategory) []string {
	tags := []string{product.CategoryName}
	if product.Type != "" {
		tags = append(tags, product.Type)
	}
	if product.IsHot == 1 {
		tags = append(tags, "hot")
	}
	if product.IsRecommend == 1 {
		tags = append(tags, "recommend")
	}
	if strings.Contains(strings.ToLower(product.Description), "自动") {
		tags = append(tags, "auto-delivery")
	}
	cleaned := make([]string, 0, len(tags))
	seen := map[string]struct{}{}
	for _, tag := range tags {
		tag = strings.TrimSpace(tag)
		if tag == "" {
			continue
		}
		if _, ok := seen[tag]; ok {
			continue
		}
		seen[tag] = struct{}{}
		cleaned = append(cleaned, tag)
	}
	if len(cleaned) == 0 {
		return []string{"digital", "service"}
	}
	return cleaned
}

func (s *Service) buildProductListCacheKey(ctx context.Context, query productdto.ProductListQuery) string {
	version := s.getCacheVersion(ctx)
	page := query.Page
	if page <= 0 {
		page = 1
	}
	pageSize := query.PageSize
	if pageSize <= 0 || pageSize > 50 {
		pageSize = 10
	}
	return fmt.Sprintf(
		"devstore:prod:products:list:v%s:cat:%d:type:%s:keyword:%s:sort:%s:order:%s:page:%d:size:%d",
		version,
		query.CategoryID,
		url.QueryEscape(strings.TrimSpace(query.Type)),
		url.QueryEscape(strings.TrimSpace(query.Keyword)),
		url.QueryEscape(strings.TrimSpace(query.Sort)),
		url.QueryEscape(strings.TrimSpace(query.Order)),
		page,
		pageSize,
	)
}

func (s *Service) buildProductDetailCacheKey(ctx context.Context, id uint64) string {
	return fmt.Sprintf("devstore:prod:products:detail:v%s:%d", s.getCacheVersion(ctx), id)
}

func (s *Service) getCacheVersion(ctx context.Context) string {
	if s.redis == nil {
		return "0"
	}
	version, err := s.redis.Get(ctx, productCacheVersionKey).Result()
	if err != nil {
		return "0"
	}
	if strings.TrimSpace(version) == "" {
		return "0"
	}
	return version
}

func (s *Service) bumpCacheVersion(ctx context.Context) {
	if s.redis == nil {
		return
	}
	_ = s.redis.Incr(ctx, productCacheVersionKey).Err()
}

func (s *Service) loadCache(ctx context.Context, key string, target interface{}) bool {
	if s.redis == nil || strings.TrimSpace(key) == "" {
		return false
	}
	payload, err := s.redis.Get(ctx, key).Bytes()
	if err != nil {
		return false
	}
	return json.Unmarshal(payload, target) == nil
}

func (s *Service) saveCache(ctx context.Context, key string, value interface{}, ttl time.Duration) {
	if s.redis == nil || strings.TrimSpace(key) == "" || ttl <= 0 {
		return
	}
	payload, err := json.Marshal(value)
	if err != nil {
		return
	}
	_ = s.redis.Set(ctx, key, payload, ttl).Err()
}

func bumpProductViewCount(result map[string]interface{}) {
	productValue, ok := result["product"]
	if !ok {
		return
	}
	productMap, ok := productValue.(map[string]interface{})
	if !ok {
		return
	}
	if viewCount, ok := productMap["view_count"].(float64); ok {
		productMap["view_count"] = viewCount + 1
	}
}
