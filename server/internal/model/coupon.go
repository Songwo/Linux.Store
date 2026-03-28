package model

import "time"

type CouponTemplate struct {
	ID              uint64    `gorm:"primaryKey" json:"id"`
	Name            string    `gorm:"column:name" json:"name"`
	Type            string    `gorm:"column:type" json:"type"`
	Total           int       `gorm:"column:total" json:"total"`
	Issued          int       `gorm:"column:issued" json:"issued"`
	Amount          float64   `gorm:"column:amount" json:"amount"`
	ThresholdAmount float64   `gorm:"column:threshold_amount" json:"threshold_amount"`
	PointsCost      int64     `gorm:"column:points_cost" json:"points_cost"`
	Status          int8      `gorm:"column:status" json:"status"`
	StartAt         *time.Time `gorm:"column:start_at" json:"start_at,omitempty"`
	EndAt           *time.Time `gorm:"column:end_at" json:"end_at,omitempty"`
	Description     string    `gorm:"column:description" json:"description"`
	CreatedAt       *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt       *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (CouponTemplate) TableName() string { return "coupon_templates" }

type UserCoupon struct {
	ID         uint64     `gorm:"primaryKey" json:"id"`
	UserID     uint64     `gorm:"column:user_id" json:"user_id"`
	TemplateID uint64     `gorm:"column:template_id" json:"template_id"`
	CouponCode string     `gorm:"column:coupon_code" json:"coupon_code"`
	Status     int8       `gorm:"column:status" json:"status"`
	ReceivedAt *time.Time  `gorm:"column:received_at" json:"received_at,omitempty"`
	UsedAt     *time.Time  `gorm:"column:used_at" json:"used_at,omitempty"`
	ExpiredAt  *time.Time  `gorm:"column:expired_at" json:"expired_at,omitempty"`
	OrderNo    string     `gorm:"column:order_no" json:"order_no"`
}

func (UserCoupon) TableName() string { return "user_coupons" }

type Campaign struct {
	ID        uint64    `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"column:name" json:"name"`
	Type      string    `gorm:"column:type" json:"type"`
	Status    int8      `gorm:"column:status" json:"status"`
	StartAt   *time.Time `gorm:"column:start_at" json:"start_at,omitempty"`
	EndAt     *time.Time `gorm:"column:end_at" json:"end_at,omitempty"`
	Banner    string    `gorm:"column:banner" json:"banner"`
	Rules     string    `gorm:"column:rules" json:"rules"`
	CreatedAt *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (Campaign) TableName() string { return "campaigns" }
