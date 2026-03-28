package repository

import (
	"context"

	"devstore/server/internal/model"
	reviewdto "devstore/server/internal/module/review/dto"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func New(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

// CreateReview creates a new review and updates the product's rating and review count atomically.
func (r *Repository) CreateReview(ctx context.Context, review *model.ProductReview) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Insert the review
		if err := tx.Create(review).Error; err != nil {
			return err
		}

		// Update product rating and review count
		// Formula: new_rating = ((old_rating * old_count) + new_rating) / (old_count + 1)
		err := tx.Exec(`
			UPDATE products 
			SET rating = ((rating * review_count) + ?) / (review_count + 1),
			    review_count = review_count + 1
			WHERE id = ?`,
			review.Rating, review.ProductID).Error
		if err != nil {
			return err
		}

		return nil
	})
}

// ListReviews lists reviews for a product with pagination, joining user details.
func (r *Repository) ListReviews(ctx context.Context, productID uint64, query reviewdto.ReviewListQuery) ([]reviewdto.ReviewItem, int64, error) {
	page := query.Page
	if page <= 0 {
		page = 1
	}
	pageSize := query.PageSize
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 10
	}

	base := r.db.WithContext(ctx).Table("product_reviews pr").
		Select("pr.id, pr.product_id, pr.user_id, pr.rating, pr.content, pr.created_at, u.nickname, u.avatar").
		Joins("left join users u on pr.user_id = u.id").
		Where("pr.product_id = ? AND pr.deleted_at IS NULL", productID)

	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var lists []reviewdto.ReviewItem
	err := base.Order("pr.created_at desc").Offset((page - 1) * pageSize).Limit(pageSize).Find(&lists).Error
	if err != nil {
		return nil, 0, err
	}

	return lists, total, nil
}
