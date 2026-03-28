package repository

import (
	"context"

	"devstore/server/internal/model"
	"gorm.io/gorm"
)

type Repository struct{ db *gorm.DB }

func New(db *gorm.DB) *Repository { return &Repository{db: db} }

func (r *Repository) List(ctx context.Context) ([]model.Category, error) {
	var items []model.Category
	err := r.db.WithContext(ctx).Where("status = ?", 1).Order("sort desc, id asc").Find(&items).Error
	return items, err
}

func (r *Repository) AdminList(ctx context.Context) ([]model.Category, error) {
	var items []model.Category
	err := r.db.WithContext(ctx).Order("sort desc, id asc").Find(&items).Error
	return items, err
}

func (r *Repository) GetByID(ctx context.Context, id uint64) (*model.Category, error) {
	var item model.Category
	if err := r.db.WithContext(ctx).First(&item, id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *Repository) Create(ctx context.Context, category *model.Category) error {
	return r.db.WithContext(ctx).Create(category).Error
}

func (r *Repository) Update(ctx context.Context, category *model.Category) error {
	return r.db.WithContext(ctx).
		Model(&model.Category{}).
		Where("id = ?", category.ID).
		Select("ParentID", "Name", "Icon", "Sort", "Status").
		Updates(category).Error
}
