package model

import "time"

type CardSecretProfile struct {
	ID             uint64     `gorm:"primaryKey" json:"id"`
	ProductID      uint64     `gorm:"column:product_id" json:"product_id"`
	SKUID          uint64     `gorm:"column:sku_id" json:"sku_id"`
	ProfileName    string     `gorm:"column:profile_name" json:"profile_name"`
	ProductURL     string     `gorm:"column:product_url" json:"product_url"`
	RedeemURL      string     `gorm:"column:redeem_url" json:"redeem_url"`
	GuideText      string     `gorm:"column:guide_text" json:"guide_text"`
	PrivacyNote    string     `gorm:"column:privacy_note" json:"privacy_note"`
	SupportContact string     `gorm:"column:support_contact" json:"support_contact"`
	Status         int8       `gorm:"column:status" json:"status"`
	CreatedAt      *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt      *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (CardSecretProfile) TableName() string { return "card_secret_profiles" }

type CardSecretItem struct {
	ID               uint64     `gorm:"primaryKey" json:"id"`
	ProfileID        uint64     `gorm:"column:profile_id" json:"profile_id"`
	ProductID        uint64     `gorm:"column:product_id" json:"product_id"`
	SKUID            uint64     `gorm:"column:sku_id" json:"sku_id"`
	BatchNo          string     `gorm:"column:batch_no" json:"batch_no"`
	MaskedSummary    string     `gorm:"column:masked_summary" json:"masked_summary"`
	SecretHash       string     `gorm:"column:secret_hash" json:"-"`
	EncryptedPayload string     `gorm:"column:encrypted_payload" json:"-"`
	Status           int8       `gorm:"column:status" json:"status"`
	OrderNo          string     `gorm:"column:order_no" json:"order_no"`
	OrderItemID      *uint64    `gorm:"column:order_item_id" json:"order_item_id,omitempty"`
	UserID           *uint64    `gorm:"column:user_id" json:"user_id,omitempty"`
	AssignedAt       *time.Time `gorm:"column:assigned_at" json:"assigned_at,omitempty"`
	RevealedAt       *time.Time `gorm:"column:revealed_at" json:"revealed_at,omitempty"`
	RevealCount      int64      `gorm:"column:reveal_count" json:"reveal_count"`
	RedeemedAt       *time.Time `gorm:"column:redeemed_at" json:"redeemed_at,omitempty"`
	DisabledAt       *time.Time `gorm:"column:disabled_at" json:"disabled_at,omitempty"`
	CreatedAt        *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt        *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (CardSecretItem) TableName() string { return "card_secret_items" }

type CardSecretAccessLog struct {
	ID               uint64     `gorm:"primaryKey" json:"id"`
	CardSecretItemID uint64     `gorm:"column:card_secret_item_id" json:"card_secret_item_id"`
	ProfileID        uint64     `gorm:"column:profile_id" json:"profile_id"`
	UserID           uint64     `gorm:"column:user_id" json:"user_id"`
	Action           string     `gorm:"column:action" json:"action"`
	IP               string     `gorm:"column:ip" json:"ip"`
	UserAgent        string     `gorm:"column:user_agent" json:"user_agent"`
	CreatedAt        *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
}

func (CardSecretAccessLog) TableName() string { return "card_secret_access_logs" }
