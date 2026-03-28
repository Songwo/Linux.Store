package repository

import (
	"context"
	"strings"
	"time"

	"devstore/server/internal/model"
	productdto "devstore/server/internal/module/product/dto"
	"gorm.io/gorm"
)

type ProductWithCategory struct {
	model.Product
	CategoryName string `gorm:"column:category_name" json:"category_name"`
	DefaultSKUID uint64 `gorm:"column:default_sku_id" json:"default_sku_id"`
}

type Repository struct{ db *gorm.DB }

func New(db *gorm.DB) *Repository { return &Repository{db: db} }

func (r *Repository) ListCategories(ctx context.Context) ([]model.Category, error) {
	var categories []model.Category
	err := r.db.WithContext(ctx).Where("status = ?", 1).Order("sort desc, id asc").Find(&categories).Error
	return categories, err
}

func (r *Repository) ListProducts(ctx context.Context, query productdto.ProductListQuery, admin bool) ([]ProductWithCategory, int64, error) {
	page := query.Page
	if page <= 0 {
		page = 1
	}
	pageSize := query.PageSize
	if pageSize <= 0 || pageSize > 50 {
		pageSize = 10
	}

	base := r.db.WithContext(ctx).
		Table("products p").
		Select("p.*, c.name as category_name, COALESCE(sku_default.default_sku_id, 0) as default_sku_id").
		Joins("left join categories c on c.id = p.category_id").
		Joins("left join (select product_id, min(id) as default_sku_id from product_skus group by product_id) sku_default on sku_default.product_id = p.id").
		Where("p.deleted_at IS NULL")
	if !admin {
		base = base.Where("p.status = ?", 1)
	}
	if query.CategoryID > 0 {
		base = base.Where("p.category_id = ?", query.CategoryID)
	}
	if t := strings.TrimSpace(query.Type); t != "" && t != "all" {
		base = base.Where("p.type = ?", t)
	}
	if keyword := strings.TrimSpace(query.Keyword); keyword != "" {
		like := "%" + keyword + "%"
		base = base.Where("p.name like ? or p.subtitle like ? or p.description like ?", like, like, like)
	}

	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var rows []ProductWithCategory
	err := base.Order(resolveSort(query.Sort, query.Order)).Offset((page - 1) * pageSize).Limit(pageSize).Find(&rows).Error
	return rows, total, err
}

func resolveSort(sortField, order string) string {
	direction := "desc"
	if strings.EqualFold(order, "asc") {
		direction = "asc"
	}
	switch strings.TrimSpace(sortField) {
	case "stock":
		return "p.stock " + direction + ", p.id desc"
	case "sales":
		return "p.sales_count " + direction + ", p.id desc"
	case "price":
		return "p.price " + direction + ", p.id desc"
	default:
		return "p.is_recommend desc, p.is_hot desc, p.id desc"
	}
}

func (r *Repository) GetProductByID(ctx context.Context, id uint64) (*ProductWithCategory, error) {
	var row ProductWithCategory
	err := r.db.WithContext(ctx).
		Table("products p").
		Select("p.*, c.name as category_name, COALESCE(sku_default.default_sku_id, 0) as default_sku_id").
		Joins("left join categories c on c.id = p.category_id").
		Joins("left join (select product_id, min(id) as default_sku_id from product_skus group by product_id) sku_default on sku_default.product_id = p.id").
		Where("p.id = ? and p.deleted_at IS NULL", id).
		First(&row).Error
	if err != nil {
		return nil, err
	}
	return &row, nil
}

func (r *Repository) ListSKUs(ctx context.Context, productID uint64) ([]model.ProductSKU, error) {
	var items []model.ProductSKU
	err := r.db.WithContext(ctx).Where("product_id = ?", productID).Order("id asc").Find(&items).Error
	return items, err
}

func (r *Repository) ListImages(ctx context.Context, productID uint64) ([]model.ProductImage, error) {
	var items []model.ProductImage
	err := r.db.WithContext(ctx).Where("product_id = ?", productID).Order("sort asc, id asc").Find(&items).Error
	return items, err
}

func (r *Repository) IncreaseViewCount(ctx context.Context, id uint64) error {
	return r.db.WithContext(ctx).Model(&model.Product{}).Where("id = ?", id).UpdateColumn("view_count", gorm.Expr("view_count + 1")).Error
}

func (r *Repository) ListRelated(ctx context.Context, categoryID, excludeID uint64) ([]ProductWithCategory, error) {
	var rows []ProductWithCategory
	// 1. Try to find products in the same category
	err := r.db.WithContext(ctx).
		Table("products p").
		Select("p.*, c.name as category_name, COALESCE(sku_default.default_sku_id, 0) as default_sku_id").
		Joins("left join categories c on c.id = p.category_id").
		Joins("left join (select product_id, min(id) as default_sku_id from product_skus group by product_id) sku_default on sku_default.product_id = p.id").
		Where("p.category_id = ? AND p.id <> ? AND p.status = 1 AND p.deleted_at IS NULL", categoryID, excludeID).
		Order("p.is_recommend desc, p.sales_count desc, p.id desc").
		Limit(4).Find(&rows).Error
	if err != nil {
		return nil, err
	}

	// 2. If no products in the same category, fallback to general recommendations
	if len(rows) == 0 {
		err = r.db.WithContext(ctx).
			Table("products p").
			Select("p.*, c.name as category_name, COALESCE(sku_default.default_sku_id, 0) as default_sku_id").
			Joins("left join categories c on c.id = p.category_id").
			Joins("left join (select product_id, min(id) as default_sku_id from product_skus group by product_id) sku_default on sku_default.product_id = p.id").
			Where("p.id <> ? AND p.status = 1 AND p.deleted_at IS NULL", excludeID).
			Order("p.is_recommend desc, p.is_hot desc, p.sales_count desc, p.id desc").
			Limit(4).Find(&rows).Error
	}

	return rows, err
}

func (r *Repository) CreateProduct(ctx context.Context, product *model.Product, sku *model.ProductSKU, inventory *model.Inventory) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(product).Error; err != nil {
			return err
		}
		sku.ProductID = product.ID
		if err := tx.Create(sku).Error; err != nil {
			return err
		}
		inventory.ProductID = product.ID
		inventory.SKUID = sku.ID
		if err := tx.Create(inventory).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *Repository) GetActiveSeckillBySKU(ctx context.Context, skuID uint64) (map[string]interface{}, error) {
	var row struct {
		ID                uint64     `gorm:"column:id"`
		SeckillCampaignID uint64     `gorm:"column:seckill_campaign_id"`
		SeckillPrice      float64    `gorm:"column:seckill_price"`
		CampaignName      string     `gorm:"column:campaign_name"`
		StartAt           *time.Time `gorm:"column:start_at"`
		EndAt             *time.Time `gorm:"column:end_at"`
	}
	now := time.Now()
	err := r.db.WithContext(ctx).Table("seckill_goods sg").
		Select("sg.id, sg.seckill_campaign_id, sg.seckill_price, COALESCE(NULLIF(c.name, ''), sc.name) as campaign_name, CASE WHEN c.id IS NULL THEN sc.start_at ELSE c.start_at END as start_at, CASE WHEN c.id IS NULL THEN sc.end_at ELSE c.end_at END as end_at").
		Joins("join seckill_campaigns sc on sc.id = sg.seckill_campaign_id").
		Joins("left join campaigns c on c.id = sc.campaign_id").
		Where("sg.sku_id = ? AND sg.status = 1 AND sc.status = 1 AND (c.id IS NULL OR c.status = 1) AND sc.start_at <= ? AND sc.end_at >= ? AND (c.id IS NULL OR (c.start_at <= ? AND c.end_at >= ?))", skuID, now, now, now, now).
		Order("sc.start_at asc").
		First(&row).Error
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{
		"campaign_id":   row.SeckillCampaignID,
		"seckill_price": row.SeckillPrice,
		"campaign_name": row.CampaignName,
		"start_at":      row.StartAt,
		"end_at":        row.EndAt,
	}, nil
}

func (r *Repository) UpdateProduct(ctx context.Context, id uint64, updates map[string]interface{}) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&model.Product{}).Where("id = ?", id).Updates(updates).Error; err != nil {
			return err
		}
		stock, hasStock := updates["stock"]
		if hasStock {
			if err := tx.Model(&model.ProductSKU{}).Where("product_id = ?", id).Updates(map[string]interface{}{"stock": stock, "price": updates["price"], "points_price": updates["points_price"], "title": updates["name"], "status": updates["status"]}).Error; err != nil {
				return err
			}
			if err := tx.Model(&model.Inventory{}).Where("product_id = ?", id).Updates(map[string]interface{}{"total_stock": stock, "available_stock": stock, "reserved_stock": 0, "version": gorm.Expr("version + 1")}).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
