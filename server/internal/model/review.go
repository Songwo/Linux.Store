package model

import "time"

type ProductReview struct {
	ID        uint64     `gorm:"primaryKey" json:"id"`
	ProductID uint64     `gorm:"column:product_id" json:"product_id"`
	UserID    uint64     `gorm:"column:user_id" json:"user_id"`
	Rating    int8       `gorm:"column:rating" json:"rating"`
	Content   string     `gorm:"column:content" json:"content"`
	CreatedAt *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
	DeletedAt *time.Time `gorm:"column:deleted_at" json:"deleted_at,omitempty"`
}

func (ProductReview) TableName() string { return "product_reviews" }
