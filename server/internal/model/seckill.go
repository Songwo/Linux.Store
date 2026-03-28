package model

import "time"

type SeckillCampaign struct {
	ID           uint64     `gorm:"primaryKey" json:"id"`
	CampaignID   uint64     `gorm:"column:campaign_id" json:"campaign_id"`
	Name         string     `gorm:"column:name" json:"name"`
	Status       int8       `gorm:"column:status" json:"status"`
	StartAt      *time.Time  `gorm:"column:start_at" json:"start_at,omitempty"`
	EndAt        *time.Time  `gorm:"column:end_at" json:"end_at,omitempty"`
	WarmupAt     *time.Time `gorm:"column:warmup_at" json:"warmup_at,omitempty"`
	LimitPerUser int        `gorm:"column:limit_per_user" json:"limit_per_user"`
	CreatedAt    *time.Time  `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt    *time.Time  `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (SeckillCampaign) TableName() string { return "seckill_campaigns" }

type SeckillGood struct {
	ID                uint64    `gorm:"primaryKey" json:"id"`
	SeckillCampaignID uint64    `gorm:"column:seckill_campaign_id" json:"seckill_campaign_id"`
	ProductID         uint64    `gorm:"column:product_id" json:"product_id"`
	SKUID             uint64    `gorm:"column:sku_id" json:"sku_id"`
	SeckillPrice      float64   `gorm:"column:seckill_price" json:"seckill_price"`
	Stock             int64     `gorm:"column:stock" json:"stock"`
	AvailableStock    int64     `gorm:"column:available_stock" json:"available_stock"`
	LockedStock       int64     `gorm:"column:locked_stock" json:"locked_stock"`
	Status            int8      `gorm:"column:status" json:"status"`
	CreatedAt         *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt         *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (SeckillGood) TableName() string { return "seckill_goods" }
