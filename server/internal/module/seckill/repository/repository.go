package repository

import (
	"context"
	"time"

	"devstore/server/internal/model"
	"gorm.io/gorm"
)

type SeckillItem struct {
	model.SeckillGood
	CampaignName   string     `gorm:"column:campaign_name" json:"campaign_name"`
	ProductName    string     `gorm:"column:product_name" json:"product_name"`
	CampaignStatus int8       `gorm:"column:campaign_status" json:"campaign_status"`
	StartAt        *time.Time `gorm:"column:start_at" json:"start_at"`
	EndAt          *time.Time `gorm:"column:end_at" json:"end_at"`
	Progress       float64    `gorm:"column:progress" json:"progress"`
}

type Repository struct{ db *gorm.DB }

func New(db *gorm.DB) *Repository { return &Repository{db: db} }

const seckillItemSelect = `
sg.*,
COALESCE(NULLIF(c.name, ''), sc.name) as campaign_name,
p.name as product_name,
CASE WHEN sc.status = 1 AND (c.id IS NULL OR c.status = 1) THEN 1 ELSE 0 END as campaign_status,
CASE WHEN c.id IS NULL THEN sc.start_at ELSE c.start_at END as start_at,
CASE WHEN c.id IS NULL THEN sc.end_at ELSE c.end_at END as end_at,
CASE WHEN sg.stock > 0 THEN (CAST(sg.available_stock AS DECIMAL(18,2)) / sg.stock * 100) ELSE 0 END as progress`

const adminSeckillItemSelect = `
sg.*,
COALESCE(NULLIF(c.name, ''), sc.name) as campaign_name,
p.name as product_name,
CASE WHEN sg.stock > 0 THEN (CAST(sg.available_stock AS DECIMAL(18,2)) / sg.stock * 100) ELSE 0 END as progress`

func (r *Repository) GetGood(ctx context.Context, campaignID, skuID uint64) (*SeckillItem, error) {
	var item SeckillItem
	now := time.Now()
	err := r.db.WithContext(ctx).Table("seckill_goods sg").
		Select(seckillItemSelect).
		Joins("join seckill_campaigns sc on sc.id = sg.seckill_campaign_id").
		Joins("left join campaigns c on c.id = sc.campaign_id").
		Joins("join products p on p.id = sg.product_id").
		Where("sg.seckill_campaign_id = ? AND sg.sku_id = ? AND sg.status = 1 AND sc.status = 1 AND (c.id IS NULL OR c.status = 1) AND sc.start_at <= ? AND sc.end_at >= ? AND (c.id IS NULL OR (c.start_at <= ? AND c.end_at >= ?))", campaignID, skuID, now, now, now, now).
		First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *Repository) GetGoodByID(ctx context.Context, id uint64) (*model.SeckillGood, error) {
	var good model.SeckillGood
	if err := r.db.WithContext(ctx).First(&good, id).Error; err != nil {
		return nil, err
	}
	return &good, nil
}

func (r *Repository) ListGoods(ctx context.Context, campaignID uint64) ([]SeckillItem, error) {
	var items []SeckillItem
	err := r.db.WithContext(ctx).Table("seckill_goods sg").
		Select(adminSeckillItemSelect).
		Joins("join seckill_campaigns sc on sc.id = sg.seckill_campaign_id").
		Joins("left join campaigns c on c.id = sc.campaign_id").
		Joins("join products p on p.id = sg.product_id").
		Where("sc.campaign_id = ?", campaignID).
		Order("sg.id asc").
		Find(&items).Error
	return items, err
}

func (r *Repository) ListGoodsBySeckillCampaignID(ctx context.Context, seckillCampaignID uint64) ([]SeckillItem, error) {
	var items []SeckillItem
	err := r.db.WithContext(ctx).Table("seckill_goods sg").
		Select(adminSeckillItemSelect).
		Joins("join seckill_campaigns sc on sc.id = sg.seckill_campaign_id").
		Joins("left join campaigns c on c.id = sc.campaign_id").
		Joins("join products p on p.id = sg.product_id").
		Where("sg.seckill_campaign_id = ?", seckillCampaignID).
		Order("sg.id asc").
		Find(&items).Error
	return items, err
}

func (r *Repository) ListActiveGoods(ctx context.Context) ([]SeckillItem, error) {
	var items []SeckillItem
	err := r.db.WithContext(ctx).Table("seckill_goods sg").
		Select(seckillItemSelect).
		Joins("join seckill_campaigns sc on sc.id = sg.seckill_campaign_id").
		Joins("left join campaigns c on c.id = sc.campaign_id").
		Joins("join products p on p.id = sg.product_id").
		Where("sg.status = 1").
		Order("sc.status desc, sc.start_at desc, sg.id asc").
		Find(&items).Error
	return items, err
}

func (r *Repository) GetActiveSeckillBySKU(ctx context.Context, skuID uint64) (*SeckillItem, error) {
	var item SeckillItem
	now := time.Now()
	err := r.db.WithContext(ctx).Table("seckill_goods sg").
		Select(seckillItemSelect).
		Joins("join seckill_campaigns sc on sc.id = sg.seckill_campaign_id").
		Joins("left join campaigns c on c.id = sc.campaign_id").
		Joins("join products p on p.id = sg.product_id").
		Where("sg.sku_id = ? AND sg.status = 1 AND sc.status = 1 AND (c.id IS NULL OR c.status = 1) AND sc.start_at <= ? AND sc.end_at >= ? AND (c.id IS NULL OR (c.start_at <= ? AND c.end_at >= ?))", skuID, now, now, now, now).
		Order("sc.start_at asc").
		First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *Repository) GetOccupiedStock(ctx context.Context, seckillCampaignID, skuID uint64) (int64, error) {
	var row struct {
		Qty int64 `gorm:"column:qty"`
	}
	err := r.db.WithContext(ctx).Table("orders o").
		Select("COALESCE(SUM(oi.quantity), 0) as qty").
		Joins("join order_items oi on oi.order_no = o.order_no").
		Where("o.order_type = ? AND o.campaign_id = ? AND oi.sku_id = ? AND o.status NOT IN ?", "seckill", seckillCampaignID, skuID, []int{30, 40}).
		Scan(&row).Error
	return row.Qty, err
}

// Admin Methods

func (r *Repository) ListCampaigns(ctx context.Context) ([]model.SeckillCampaign, error) {
	var items []model.SeckillCampaign
	err := r.db.WithContext(ctx).Order("id desc").Find(&items).Error
	return items, err
}

func (r *Repository) CreateCampaign(ctx context.Context, campaign *model.SeckillCampaign) error {
	return r.db.WithContext(ctx).Create(campaign).Error
}

func (r *Repository) UpdateCampaign(ctx context.Context, campaign *model.SeckillCampaign) error {
	return r.db.WithContext(ctx).Model(campaign).Select("Name", "Status", "StartAt", "EndAt").Updates(campaign).Error
}

func (r *Repository) DeleteCampaign(ctx context.Context, id uint64) error {
	return r.db.WithContext(ctx).Delete(&model.SeckillCampaign{}, id).Error
}

func (r *Repository) EnsureSeckillCampaign(ctx context.Context, campaignID uint64) (uint64, error) {
	var sc model.SeckillCampaign
	err := r.db.WithContext(ctx).Where("campaign_id = ?", campaignID).First(&sc).Error
	if err == nil {
		return sc.ID, nil
	}

	if err != gorm.ErrRecordNotFound {
		return 0, err
	}

	var c model.Campaign
	if err := r.db.WithContext(ctx).First(&c, campaignID).Error; err != nil {
		return 0, err
	}

	sc = model.SeckillCampaign{
		CampaignID: c.ID,
		Name:       c.Name,
		Status:     c.Status,
		StartAt:    c.StartAt,
		EndAt:      c.EndAt,
	}
	if err := r.db.WithContext(ctx).Create(&sc).Error; err != nil {
		return 0, err
	}

	return sc.ID, nil
}

func (r *Repository) AddGood(ctx context.Context, good *model.SeckillGood) error {
	return r.db.WithContext(ctx).Create(good).Error
}

func (r *Repository) UpdateGood(ctx context.Context, good *model.SeckillGood) error {
	return r.db.WithContext(ctx).Model(good).Select("SeckillPrice", "Stock", "AvailableStock", "LockedStock", "Status").Updates(good).Error
}

func (r *Repository) DeleteGood(ctx context.Context, id uint64) error {
	return r.db.WithContext(ctx).Delete(&model.SeckillGood{}, id).Error
}
