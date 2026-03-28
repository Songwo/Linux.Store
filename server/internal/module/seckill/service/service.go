package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/model"
	seckilldto "devstore/server/internal/module/seckill/dto"
	seckillrepo "devstore/server/internal/module/seckill/repository"
	"devstore/server/internal/mq/message"
	mqproducer "devstore/server/internal/mq/producer"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

const (
	seckillActiveListCacheTTL = 3 * time.Second
	seckillCacheVersionKey    = "devstore:prod:seckill:cache:version"
)

type Service struct {
	repo      *seckillrepo.Repository
	redis     *redis.Client
	producer  *mqproducer.Producer
	luaScript string
}

func New(repo *seckillrepo.Repository, redisClient *redis.Client, producer *mqproducer.Producer) *Service {
	luaPath := filepath.Join("internal", "module", "seckill", "scripts", "purchase.lua")
	data, _ := os.ReadFile(luaPath)
	return &Service{repo: repo, redis: redisClient, producer: producer, luaScript: string(data)}
}

func (s *Service) Warmup(ctx context.Context, campaignID uint64) (interface{}, *apperr.AppError) {
	goods, err := s.repo.ListGoods(ctx, campaignID)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "加载秒杀商品失败", err)
	}

	var seckillCampaignID uint64
	for _, item := range goods {
		availableStock, appErr := s.reconcileAvailableStock(ctx, &item.SeckillGood)
		if appErr != nil {
			return nil, appErr
		}
		seckillCampaignID = item.SeckillCampaignID
		stockKey := fmt.Sprintf("devstore:prod:seckill:stock:%d:%d", item.SeckillCampaignID, item.SKUID)
		campaignKey := fmt.Sprintf("devstore:prod:seckill:campaign:%d", item.SeckillCampaignID)
		_ = s.redis.Set(ctx, stockKey, availableStock, 2*time.Hour).Err()
		_ = s.redis.HSet(ctx, campaignKey, map[string]interface{}{"name": item.CampaignName, "campaign_id": item.SeckillCampaignID, "updated_at": time.Now().Format(time.RFC3339)}).Err()
	}
	return map[string]interface{}{"campaign_id": campaignID, "seckill_campaign_id": seckillCampaignID, "goods_count": len(goods), "status": "warmed"}, nil
}

func (s *Service) ListActiveGoods(ctx context.Context) (interface{}, *apperr.AppError) {
	items, appErr := s.loadActiveGoods(ctx)
	if appErr != nil {
		return nil, appErr
	}
	if appErr := s.syncRealtimeStock(ctx, items); appErr != nil {
		return nil, appErr
	}
	return items, nil
}

func (s *Service) Purchase(ctx context.Context, userID uint64, req seckilldto.PurchaseRequest, traceID string) (interface{}, *apperr.AppError) {
	item, err := s.repo.GetGood(ctx, req.CampaignID, req.SKUID)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeNotFound, "秒杀商品不存在", err)
	}
	stockKey := fmt.Sprintf("devstore:prod:seckill:stock:%d:%d", req.CampaignID, req.SKUID)
	buyersKey := fmt.Sprintf("devstore:prod:seckill:buyers:%d:%d", req.CampaignID, req.SKUID)
	reqKey := fmt.Sprintf("devstore:prod:seckill:req:%d:%d", req.CampaignID, userID)
	resultKey := fmt.Sprintf("devstore:prod:seckill:result:%d:%d", req.CampaignID, userID)

	if appErr := s.ensureRedisStock(ctx, item); appErr != nil {
		return nil, appErr
	}
	if s.luaScript == "" {
		return nil, apperr.New(apperr.CodeInternalError, "秒杀脚本未加载")
	}
	res, err := s.redis.Eval(ctx, s.luaScript, []string{stockKey, buyersKey, reqKey}, userID, 10).Int()
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "执行秒杀脚本失败", err)
	}
	switch res {
	case 1:
		return nil, apperr.New(apperr.CodeStockNotEnough, "库存不足")
	case 2:
		return nil, apperr.New(apperr.CodeSeckillRepeat, "重复参与秒杀")
	case 3:
		return nil, apperr.New(apperr.CodeSeckillBusy, "请求过于频繁")
	}

	_ = s.redis.Set(ctx, resultKey, "queueing", 24*time.Hour).Err()
	msg := message.NewEnvelope(uuid.NewString(), "seckill.order.create", fmt.Sprintf("campaign:%d:user:%d", req.CampaignID, userID), traceID, map[string]interface{}{"campaign_id": req.CampaignID, "sku_id": req.SKUID, "user_id": userID, "price": item.SeckillPrice})
	if err := s.producer.Publish(ctx, message.ExchangeSeckill, message.RoutingSeckillOrder, msg); err != nil {
		_ = s.redis.Del(ctx, reqKey).Err()
		_ = s.redis.Incr(ctx, stockKey).Err()
		_ = s.redis.SRem(ctx, buyersKey, userID).Err()
		return nil, apperr.Wrap(apperr.CodeInternalError, "发送秒杀订单消息失败", err)
	}
	return map[string]interface{}{"status": "queueing", "campaign_id": req.CampaignID, "sku_id": req.SKUID}, nil
}

func (s *Service) QueryResult(ctx context.Context, userID, campaignID uint64) (interface{}, *apperr.AppError) {
	resultKey := fmt.Sprintf("devstore:prod:seckill:result:%d:%d", campaignID, userID)
	result, err := s.redis.Get(ctx, resultKey).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return map[string]string{"status": "none"}, nil
		}
		return nil, apperr.Wrap(apperr.CodeInternalError, "查询秒杀结果失败", err)
	}
	return map[string]string{"status": result}, nil
}

func (s *Service) AdminListCampaigns(ctx context.Context) (interface{}, *apperr.AppError) {
	items, err := s.repo.ListCampaigns(ctx)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load admin seckill campaign list failed", err)
	}
	return items, nil
}

func (s *Service) CreateCampaign(ctx context.Context, campaign *model.SeckillCampaign) *apperr.AppError {
	if err := s.repo.CreateCampaign(ctx, campaign); err != nil {
		return apperr.Wrap(apperr.CodeInternalError, "create seckill campaign failed", err)
	}
	s.bumpCacheVersion(ctx)
	return nil
}

func (s *Service) UpdateCampaign(ctx context.Context, campaign *model.SeckillCampaign) *apperr.AppError {
	if err := s.repo.UpdateCampaign(ctx, campaign); err != nil {
		return apperr.Wrap(apperr.CodeInternalError, "update seckill campaign failed", err)
	}
	goods, _ := s.repo.ListGoodsBySeckillCampaignID(ctx, campaign.ID)
	s.clearCampaignCache(ctx, campaign.ID, goods)
	return nil
}

func (s *Service) DeleteCampaign(ctx context.Context, id uint64) *apperr.AppError {
	goods, _ := s.repo.ListGoodsBySeckillCampaignID(ctx, id)
	s.clearCampaignCache(ctx, id, goods)
	if err := s.repo.DeleteCampaign(ctx, id); err != nil {
		return apperr.Wrap(apperr.CodeInternalError, "delete seckill campaign failed", err)
	}
	return nil
}

func (s *Service) AdminListGoods(ctx context.Context, campaignID uint64) (interface{}, *apperr.AppError) {
	items, err := s.repo.ListGoods(ctx, campaignID)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load admin seckill goods failed", err)
	}
	if appErr := s.syncRealtimeStock(ctx, items); appErr != nil {
		return nil, appErr
	}
	return items, nil
}

func (s *Service) AddGood(ctx context.Context, good *model.SeckillGood) *apperr.AppError {
	scID, err := s.repo.EnsureSeckillCampaign(ctx, good.SeckillCampaignID)
	if err != nil {
		return apperr.Wrap(apperr.CodeNotFound, "找不到对应的秒杀活动", err)
	}
	if good.Stock <= 0 {
		return apperr.New(apperr.CodeValidationError, "秒杀库存必须大于 0")
	}
	good.SeckillCampaignID = scID
	good.AvailableStock = good.Stock
	good.LockedStock = 0
	if err := s.repo.AddGood(ctx, good); err != nil {
		if err != nil && strings.Contains(err.Error(), "Duplicate entry") {
			return apperr.Wrap(apperr.CodeValidationError, "该商品已配置在此秒杀活动中", err)
		}
		return apperr.Wrap(apperr.CodeInternalError, "add seckill good failed", err)
	}
	s.clearSingleGoodCache(ctx, good.SeckillCampaignID, good.SKUID)
	return nil
}

func (s *Service) UpdateGood(ctx context.Context, good *model.SeckillGood) *apperr.AppError {
	current, err := s.repo.GetGoodByID(ctx, good.ID)
	if err != nil {
		return apperr.Wrap(apperr.CodeNotFound, "秒杀商品不存在", err)
	}
	if good.Stock <= 0 {
		return apperr.New(apperr.CodeValidationError, "秒杀库存必须大于 0")
	}
	occupied, err := s.repo.GetOccupiedStock(ctx, current.SeckillCampaignID, current.SKUID)
	if err != nil {
		return apperr.Wrap(apperr.CodeInternalError, "统计秒杀占用库存失败", err)
	}
	if good.Stock < occupied {
		return apperr.New(apperr.CodeValidationError, fmt.Sprintf("当前已有 %d 件库存被占用，新库存不能小于该值", occupied))
	}
	good.SeckillCampaignID = current.SeckillCampaignID
	good.ProductID = current.ProductID
	good.SKUID = current.SKUID
	good.LockedStock = 0
	good.AvailableStock = good.Stock - occupied
	if err := s.repo.UpdateGood(ctx, good); err != nil {
		return apperr.Wrap(apperr.CodeInternalError, "update seckill good failed", err)
	}
	s.clearSingleGoodCache(ctx, good.SeckillCampaignID, good.SKUID)
	return nil
}

func (s *Service) DeleteGood(ctx context.Context, id uint64) *apperr.AppError {
	good, err := s.repo.GetGoodByID(ctx, id)
	if err != nil {
		return apperr.Wrap(apperr.CodeNotFound, "秒杀商品不存在", err)
	}
	if err := s.repo.DeleteGood(ctx, id); err != nil {
		return apperr.Wrap(apperr.CodeInternalError, "delete seckill good failed", err)
	}
	s.clearSingleGoodCache(ctx, good.SeckillCampaignID, good.SKUID)
	return nil
}

func (s *Service) loadActiveGoods(ctx context.Context) ([]seckillrepo.SeckillItem, *apperr.AppError) {
	cacheKey := s.buildActiveGoodsCacheKey(ctx)
	if s.redis != nil {
		if payload, err := s.redis.Get(ctx, cacheKey).Bytes(); err == nil {
			var cached []seckillrepo.SeckillItem
			if json.Unmarshal(payload, &cached) == nil {
				return cached, nil
			}
		}
	}

	items, err := s.repo.ListActiveGoods(ctx)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "加载有效秒杀商品失败", err)
	}
	if s.redis != nil {
		if payload, err := json.Marshal(items); err == nil {
			_ = s.redis.Set(ctx, cacheKey, payload, seckillActiveListCacheTTL).Err()
		}
	}
	return items, nil
}

func (s *Service) syncRealtimeStock(ctx context.Context, items []seckillrepo.SeckillItem) *apperr.AppError {
	if len(items) == 0 {
		return nil
	}

	keys := make([]string, len(items))
	for i := range items {
		keys[i] = fmt.Sprintf("devstore:prod:seckill:stock:%d:%d", items[i].SeckillCampaignID, items[i].SKUID)
	}

	var cacheValues []interface{}
	var err error
	if s.redis != nil {
		cacheValues, err = s.redis.MGet(ctx, keys...).Result()
		if err != nil {
			return apperr.Wrap(apperr.CodeInternalError, "读取秒杀实时库存失败", err)
		}
	}

	missingIndexes := make([]int, 0)
	for i := range items {
		if len(cacheValues) > 0 {
			if availableStock, ok := parseRedisInt64(cacheValues[i]); ok {
				items[i].AvailableStock = clampStock(availableStock, items[i].Stock)
				items[i].Progress = calculateProgress(items[i].AvailableStock, items[i].Stock)
				continue
			}
		}
		if appErr := s.ensureRedisStock(ctx, &items[i]); appErr != nil {
			return appErr
		}
		missingIndexes = append(missingIndexes, i)
	}

	if len(missingIndexes) > 0 && s.redis != nil {
		missingKeys := make([]string, 0, len(missingIndexes))
		for _, index := range missingIndexes {
			missingKeys = append(missingKeys, keys[index])
		}
		missingValues, err := s.redis.MGet(ctx, missingKeys...).Result()
		if err != nil {
			return apperr.Wrap(apperr.CodeInternalError, "读取秒杀实时库存失败", err)
		}
		for idx, itemIndex := range missingIndexes {
			if availableStock, ok := parseRedisInt64(missingValues[idx]); ok {
				items[itemIndex].AvailableStock = clampStock(availableStock, items[itemIndex].Stock)
			} else {
				items[itemIndex].AvailableStock = clampStock(items[itemIndex].AvailableStock, items[itemIndex].Stock)
			}
			items[itemIndex].Progress = calculateProgress(items[itemIndex].AvailableStock, items[itemIndex].Stock)
		}
		return nil
	}

	for i := range items {
		items[i].AvailableStock = clampStock(items[i].AvailableStock, items[i].Stock)
		items[i].Progress = calculateProgress(items[i].AvailableStock, items[i].Stock)
	}
	return nil
}

func calculateProgress(availableStock, totalStock int64) float64 {
	if totalStock <= 0 {
		return 0
	}
	if availableStock < 0 {
		availableStock = 0
	}
	if availableStock > totalStock {
		availableStock = totalStock
	}
	return float64(availableStock) / float64(totalStock) * 100
}

func (s *Service) clearCampaignCache(ctx context.Context, seckillCampaignID uint64, goods []seckillrepo.SeckillItem) {
	for _, item := range goods {
		stockKey := fmt.Sprintf("devstore:prod:seckill:stock:%d:%d", seckillCampaignID, item.SKUID)
		_ = s.redis.Del(ctx, stockKey).Err()
	}
	campaignKey := fmt.Sprintf("devstore:prod:seckill:campaign:%d", seckillCampaignID)
	_ = s.redis.Del(ctx, campaignKey).Err()
	s.bumpCacheVersion(ctx)
}

func (s *Service) clearSingleGoodCache(ctx context.Context, seckillCampaignID, skuID uint64) {
	stockKey := fmt.Sprintf("devstore:prod:seckill:stock:%d:%d", seckillCampaignID, skuID)
	campaignKey := fmt.Sprintf("devstore:prod:seckill:campaign:%d", seckillCampaignID)
	_ = s.redis.Del(ctx, stockKey).Err()
	_ = s.redis.Del(ctx, campaignKey).Err()
	s.bumpCacheVersion(ctx)
}

func (s *Service) ensureRedisStock(ctx context.Context, item *seckillrepo.SeckillItem) *apperr.AppError {
	stockKey := fmt.Sprintf("devstore:prod:seckill:stock:%d:%d", item.SeckillCampaignID, item.SKUID)
	if s.redis != nil {
		if _, err := s.redis.Get(ctx, stockKey).Result(); err == nil {
			return nil
		} else if !errors.Is(err, redis.Nil) {
			return apperr.Wrap(apperr.CodeInternalError, "查询秒杀库存缓存失败", err)
		}
	}
	availableStock, appErr := s.reconcileAvailableStock(ctx, &item.SeckillGood)
	if appErr != nil {
		return appErr
	}
	campaignKey := fmt.Sprintf("devstore:prod:seckill:campaign:%d", item.SeckillCampaignID)
	if err := s.redis.Set(ctx, stockKey, availableStock, 2*time.Hour).Err(); err != nil {
		return apperr.Wrap(apperr.CodeInternalError, "初始化秒杀库存缓存失败", err)
	}
	_ = s.redis.HSet(ctx, campaignKey, map[string]interface{}{"name": item.CampaignName, "campaign_id": item.SeckillCampaignID, "updated_at": time.Now().Format(time.RFC3339)}).Err()
	item.AvailableStock = availableStock
	return nil
}

func (s *Service) reconcileAvailableStock(ctx context.Context, good *model.SeckillGood) (int64, *apperr.AppError) {
	occupied, err := s.repo.GetOccupiedStock(ctx, good.SeckillCampaignID, good.SKUID)
	if err != nil {
		return 0, apperr.Wrap(apperr.CodeInternalError, "统计秒杀占用库存失败", err)
	}
	if occupied > good.Stock {
		return 0, apperr.New(apperr.CodeValidationError, fmt.Sprintf("秒杀商品 %d 库存数据异常：已占用 %d，大于总库存 %d", good.ID, occupied, good.Stock))
	}
	availableStock := good.Stock - occupied
	if good.AvailableStock != availableStock || good.LockedStock != 0 {
		good.AvailableStock = availableStock
		good.LockedStock = 0
		if err := s.repo.UpdateGood(ctx, good); err != nil {
			return 0, apperr.Wrap(apperr.CodeInternalError, "修正秒杀库存快照失败", err)
		}
	}
	return availableStock, nil
}

func (s *Service) buildActiveGoodsCacheKey(ctx context.Context) string {
	version := "0"
	if s.redis != nil {
		if cacheVersion, err := s.redis.Get(ctx, seckillCacheVersionKey).Result(); err == nil && cacheVersion != "" {
			version = cacheVersion
		}
	}
	return fmt.Sprintf("devstore:prod:seckill:goods:v%s", version)
}

func (s *Service) bumpCacheVersion(ctx context.Context) {
	if s.redis == nil {
		return
	}
	_ = s.redis.Incr(ctx, seckillCacheVersionKey).Err()
}

func clampStock(availableStock, totalStock int64) int64 {
	if availableStock < 0 {
		return 0
	}
	if availableStock > totalStock {
		return totalStock
	}
	return availableStock
}

func parseRedisInt64(value interface{}) (int64, bool) {
	switch typed := value.(type) {
	case nil:
		return 0, false
	case int64:
		return typed, true
	case int:
		return int64(typed), true
	case string:
		parsed, err := strconv.ParseInt(typed, 10, 64)
		return parsed, err == nil
	case []byte:
		parsed, err := strconv.ParseInt(string(typed), 10, 64)
		return parsed, err == nil
	default:
		return 0, false
	}
}
