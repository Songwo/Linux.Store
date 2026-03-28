package model

import "time"

type PaymentFlow struct {
	ID           uint64    `gorm:"primaryKey" json:"id"`
	PayNo        string    `gorm:"column:pay_no" json:"pay_no"`
	OrderNo      string    `gorm:"column:order_no" json:"order_no"`
	UserID       uint64    `gorm:"column:user_id" json:"user_id"`
	ThirdPartyNo string    `gorm:"column:third_party_no" json:"third_party_no"`
	Channel      string    `gorm:"column:channel" json:"channel"`
	EventType    string    `gorm:"column:event_type" json:"event_type"`
	RawPayload   string    `gorm:"column:raw_payload" json:"raw_payload"`
	CreatedAt    time.Time `gorm:"column:created_at" json:"created_at"`
}

func (PaymentFlow) TableName() string { return "payment_flows" }

type Announcement struct {
	ID        uint64     `gorm:"primaryKey" json:"id"`
	Title     string     `gorm:"column:title" json:"title"`
	Content   string     `gorm:"column:content" json:"content"`
	Link      string     `gorm:"column:link" json:"link"`
	Level     string     `gorm:"column:level" json:"level"`
	Sort      int        `gorm:"column:sort" json:"sort"`
	Pinned    int8       `gorm:"column:pinned" json:"pinned"`
	Status    int8       `gorm:"column:status" json:"status"`
	StartAt   *time.Time `gorm:"column:start_at" json:"start_at,omitempty"`
	EndAt     *time.Time `gorm:"column:end_at" json:"end_at,omitempty"`
	CreatedAt *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (Announcement) TableName() string { return "announcements" }

type UserWishlist struct {
	ID        uint64    `gorm:"primaryKey" json:"id"`
	UserID    uint64    `gorm:"column:user_id" json:"user_id"`
	ProductID uint64    `gorm:"column:product_id" json:"product_id"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (UserWishlist) TableName() string { return "user_wishlists" }

type DeliveryRecord struct {
	ID           uint64     `gorm:"primaryKey" json:"id"`
	OrderNo      string     `gorm:"column:order_no" json:"order_no"`
	OrderItemID  uint64     `gorm:"column:order_item_id" json:"order_item_id"`
	UserID       uint64     `gorm:"column:user_id" json:"user_id"`
	ProductID    uint64     `gorm:"column:product_id" json:"product_id"`
	SKUID        uint64     `gorm:"column:sku_id" json:"sku_id"`
	DeliveryType string     `gorm:"column:delivery_type" json:"delivery_type"`
	Content      string     `gorm:"column:content" json:"content"`
	Status       int8       `gorm:"column:status" json:"status"`
	DeliveredAt  *time.Time `gorm:"column:delivered_at" json:"delivered_at,omitempty"`
	CreatedAt    *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt    *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (DeliveryRecord) TableName() string { return "delivery_records" }
