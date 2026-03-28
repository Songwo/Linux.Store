package repository

import (
	"context"

	"devstore/server/internal/model"
	productrepo "devstore/server/internal/module/product/repository"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type WishlistItem struct {
	productrepo.ProductWithCategory
	CreatedAt string `json:"wishlisted_at" gorm:"column:wishlisted_at"`
}

type Repository struct{ db *gorm.DB }

func New(db *gorm.DB) *Repository { return &Repository{db: db} }

func (r *Repository) List(ctx context.Context, userID uint64) ([]WishlistItem, error) {
	var rows []WishlistItem
	err := r.db.WithContext(ctx).Table("user_wishlists uw").
		Select("uw.created_at as wishlisted_at, p.*, c.name as category_name").
		Joins("join products p on p.id = uw.product_id").
		Joins("left join categories c on c.id = p.category_id").
		Where("uw.user_id = ? AND p.deleted_at IS NULL", userID).
		Order("uw.id desc").
		Find(&rows).Error
	return rows, err
}

func (r *Repository) Toggle(ctx context.Context, userID, productID uint64, enabled bool) error {
	if enabled {
		row := &model.UserWishlist{UserID: userID, ProductID: productID}
		return r.db.WithContext(ctx).Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "user_id"}, {Name: "product_id"}}, DoNothing: true}).Create(row).Error
	}
	return r.db.WithContext(ctx).Where("user_id = ? AND product_id = ?", userID, productID).Delete(&model.UserWishlist{}).Error
}

func (r *Repository) Exists(ctx context.Context, userID, productID uint64) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&model.UserWishlist{}).Where("user_id = ? AND product_id = ?", userID, productID).Count(&count).Error
	return count > 0, err
}
