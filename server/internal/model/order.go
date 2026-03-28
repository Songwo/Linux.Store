package model

import "time"

type Cart struct {
	ID        uint64    `gorm:"primaryKey" json:"id"`
	UserID    uint64    `gorm:"column:user_id" json:"user_id"`
	Status    int8      `gorm:"column:status" json:"status"`
	CreatedAt *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (Cart) TableName() string { return "carts" }

type CartItem struct {
	ID        uint64    `gorm:"primaryKey" json:"id"`
	CartID    uint64    `gorm:"column:cart_id" json:"cart_id"`
	UserID    uint64    `gorm:"column:user_id" json:"user_id"`
	ProductID uint64    `gorm:"column:product_id" json:"product_id"`
	SKUID     uint64    `gorm:"column:sku_id" json:"sku_id"`
	Quantity  int       `gorm:"column:quantity" json:"quantity"`
	Checked   int8      `gorm:"column:checked" json:"checked"`
	CreatedAt *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (CartItem) TableName() string { return "cart_items" }

type Order struct {
	ID             uint64     `gorm:"primaryKey" json:"id"`
	OrderNo        string     `gorm:"column:order_no" json:"order_no"`
	UserID         uint64     `gorm:"column:user_id" json:"user_id"`
	OrderType      string     `gorm:"column:order_type" json:"order_type"`
	Status         int8       `gorm:"column:status" json:"status"`
	TotalAmount    float64    `gorm:"column:total_amount" json:"total_amount"`
	DiscountAmount float64    `gorm:"column:discount_amount" json:"discount_amount"`
	PayAmount      float64    `gorm:"column:pay_amount" json:"pay_amount"`
	PointsAmount   int64      `gorm:"column:points_amount" json:"points_amount"`
	CouponID       *uint64    `gorm:"column:coupon_id" json:"coupon_id,omitempty"`
	CampaignID     *uint64    `gorm:"column:campaign_id" json:"campaign_id,omitempty"`
	Remark         string     `gorm:"column:remark" json:"remark"`
	SubmitToken    string     `gorm:"column:submit_token" json:"submit_token"`
	PayDeadlineAt  *time.Time `gorm:"column:pay_deadline_at" json:"pay_deadline_at,omitempty"`
	PaidAt         *time.Time `gorm:"column:paid_at" json:"paid_at,omitempty"`
	ClosedAt       *time.Time `gorm:"column:closed_at" json:"closed_at,omitempty"`
	CreatedAt      *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt      *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (Order) TableName() string { return "orders" }

type OrderItem struct {
	ID          uint64    `gorm:"primaryKey" json:"id"`
	OrderID     uint64    `gorm:"column:order_id" json:"order_id"`
	OrderNo     string    `gorm:"column:order_no" json:"order_no"`
	UserID      uint64    `gorm:"column:user_id" json:"user_id"`
	ProductID   uint64    `gorm:"column:product_id" json:"product_id"`
	SKUID       uint64    `gorm:"column:sku_id" json:"sku_id"`
	ProductName string    `gorm:"column:product_name" json:"product_name"`
	SKUTitle    string    `gorm:"column:sku_title" json:"sku_title"`
	Cover       string    `gorm:"column:cover" json:"cover"`
	Price       float64   `gorm:"column:price" json:"price"`
	PointsPrice int64     `gorm:"column:points_price" json:"points_price"`
	Quantity    int       `gorm:"column:quantity" json:"quantity"`
	TotalAmount float64   `gorm:"column:total_amount" json:"total_amount"`
	CreatedAt   *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
}

func (OrderItem) TableName() string { return "order_items" }

type PaymentOrder struct {
	ID            uint64     `gorm:"primaryKey" json:"id"`
	PayNo         string     `gorm:"column:pay_no" json:"pay_no"`
	OrderNo       string     `gorm:"column:order_no" json:"order_no"`
	UserID        uint64     `gorm:"column:user_id" json:"user_id"`
	PayType       string     `gorm:"column:pay_type" json:"pay_type"`
	Status        int8       `gorm:"column:status" json:"status"`
	Amount        float64    `gorm:"column:amount" json:"amount"`
	IdempotentKey string     `gorm:"column:idempotent_key" json:"idempotent_key"`
	PaidAt        *time.Time `gorm:"column:paid_at" json:"paid_at,omitempty"`
	CreatedAt     *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt     *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (PaymentOrder) TableName() string { return "payment_orders" }

type UserBalanceAccount struct {
	ID            uint64    `gorm:"primaryKey" json:"id"`
	UserID        uint64    `gorm:"column:user_id" json:"user_id"`
	Balance       float64   `gorm:"column:balance" json:"balance"`
	FrozenBalance float64   `gorm:"column:frozen_balance" json:"frozen_balance"`
	Version       int64     `gorm:"column:version" json:"version"`
	CreatedAt     *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt     *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (UserBalanceAccount) TableName() string { return "user_balance_accounts" }

type UserBalanceFlow struct {
	ID           uint64    `gorm:"primaryKey" json:"id"`
	UserID       uint64    `gorm:"column:user_id" json:"user_id"`
	BizType      string    `gorm:"column:biz_type" json:"biz_type"`
	BizNo        string    `gorm:"column:biz_no" json:"biz_no"`
	Direction    int8      `gorm:"column:direction" json:"direction"`
	Amount       float64   `gorm:"column:amount" json:"amount"`
	BalanceAfter float64   `gorm:"column:balance_after" json:"balance_after"`
	Remark       string    `gorm:"column:remark" json:"remark"`
	CreatedAt    *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
}

func (UserBalanceFlow) TableName() string { return "user_balance_flows" }
