package model

import "time"

type Category struct {
	ID        uint64    `gorm:"primaryKey" json:"id"`
	ParentID  uint64    `gorm:"column:parent_id" json:"parent_id"`
	Name      string    `gorm:"column:name" json:"name"`
	Icon      string    `gorm:"column:icon" json:"icon"`
	Sort      int       `gorm:"column:sort" json:"sort"`
	Status    int8      `gorm:"column:status" json:"status"`
	CreatedAt *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (Category) TableName() string { return "categories" }

type Product struct {
	ID           uint64     `gorm:"primaryKey" json:"id"`
	CategoryID   uint64     `gorm:"column:category_id" json:"category_id"`
	Name         string     `gorm:"column:name" json:"name"`
	Subtitle     string     `gorm:"column:subtitle" json:"subtitle"`
	Type         string     `gorm:"column:type" json:"type"`
	Status       int8       `gorm:"column:status" json:"status"`
	Cover        string     `gorm:"column:cover" json:"cover"`
	Description  string     `gorm:"column:description" json:"description"`
	Price        float64    `gorm:"column:price" json:"price"`
	OriginPrice  float64    `gorm:"column:origin_price" json:"origin_price"`
	Rating       float64    `gorm:"column:rating" json:"rating"`
	ReviewCount  int        `gorm:"column:review_count" json:"review_count"`
	PointsPrice  int64      `gorm:"column:points_price" json:"points_price"`
	SalesCount   int64      `gorm:"column:sales_count" json:"sales_count"`
	ViewCount    int64      `gorm:"column:view_count" json:"view_count"`
	Stock        int64      `gorm:"column:stock" json:"stock"`
	LockStock    int64      `gorm:"column:lock_stock" json:"lock_stock"`
	LimitPerUser int        `gorm:"column:limit_per_user" json:"limit_per_user"`
	IsHot        int8       `gorm:"column:is_hot" json:"is_hot"`
	IsRecommend  int8       `gorm:"column:is_recommend" json:"is_recommend"`
	CreatedAt    *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt    *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
	DeletedAt    *time.Time `gorm:"column:deleted_at" json:"deleted_at,omitempty"`
}

func (Product) TableName() string { return "products" }

type ProductSKU struct {
	ID          uint64    `gorm:"primaryKey" json:"id"`
	ProductID   uint64    `gorm:"column:product_id" json:"product_id"`
	SKUCode     string    `gorm:"column:sku_code" json:"sku_code"`
	Title       string    `gorm:"column:title" json:"title"`
	Price       float64   `gorm:"column:price" json:"price"`
	PointsPrice int64     `gorm:"column:points_price" json:"points_price"`
	Stock       int64     `gorm:"column:stock" json:"stock"`
	LockStock   int64     `gorm:"column:lock_stock" json:"lock_stock"`
	Status      int8      `gorm:"column:status" json:"status"`
	CreatedAt   *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt   *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (ProductSKU) TableName() string { return "product_skus" }

type ProductImage struct {
	ID        uint64    `gorm:"primaryKey" json:"id"`
	ProductID uint64    `gorm:"column:product_id" json:"product_id"`
	ImageURL  string    `gorm:"column:image_url" json:"image_url"`
	Sort      int       `gorm:"column:sort" json:"sort"`
	CreatedAt *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
}

func (ProductImage) TableName() string { return "product_images" }

type Inventory struct {
	ID             uint64    `gorm:"primaryKey" json:"id"`
	ProductID      uint64    `gorm:"column:product_id" json:"product_id"`
	SKUID          uint64    `gorm:"column:sku_id" json:"sku_id"`
	TotalStock     int64     `gorm:"column:total_stock" json:"total_stock"`
	AvailableStock int64     `gorm:"column:available_stock" json:"available_stock"`
	ReservedStock  int64     `gorm:"column:reserved_stock" json:"reserved_stock"`
	Version        int64     `gorm:"column:version" json:"version"`
	CreatedAt      *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt      *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (Inventory) TableName() string { return "inventories" }
