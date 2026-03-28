package repository

import (
	"context"
	"strings"
	"time"

	"devstore/server/internal/model"
	"gorm.io/gorm"
)

type Repository struct{ db *gorm.DB }

func New(db *gorm.DB) *Repository { return &Repository{db: db} }

func (r *Repository) ListPublic(ctx context.Context) ([]model.Announcement, error) {
	var rows []model.Announcement
	now := time.Now()
	err := r.db.WithContext(ctx).
		Where("status = 1").
		Where("start_at IS NULL OR start_at <= ?", now).
		Where("end_at IS NULL OR end_at >= ?", now).
		Order("pinned desc, sort desc, id desc").
		Limit(6).
		Find(&rows).Error
	return rows, err
}

func (r *Repository) ListAdmin(ctx context.Context, status string, page, pageSize int) ([]model.Announcement, int64, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 10
	}
	base := r.db.WithContext(ctx).Model(&model.Announcement{})
	if strings.TrimSpace(status) != "" && status != "all" {
		base = base.Where("status = ?", status)
	}
	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var rows []model.Announcement
	err := base.Order("pinned desc, sort desc, id desc").Offset((page-1)*pageSize).Limit(pageSize).Find(&rows).Error
	return rows, total, err
}

func (r *Repository) GetByID(ctx context.Context, id uint64) (*model.Announcement, error) {
	var row model.Announcement
	if err := r.db.WithContext(ctx).First(&row, id).Error; err != nil {
		return nil, err
	}
	return &row, nil
}

func (r *Repository) Create(ctx context.Context, announcement *model.Announcement) error {
	return r.db.WithContext(ctx).Create(announcement).Error
}

func (r *Repository) Update(ctx context.Context, announcement *model.Announcement) error {
	return r.db.WithContext(ctx).Model(&model.Announcement{}).Where("id = ?", announcement.ID).Updates(map[string]interface{}{
		"title": announcement.Title,
		"content": announcement.Content,
		"link": announcement.Link,
		"level": announcement.Level,
		"sort": announcement.Sort,
		"pinned": announcement.Pinned,
		"status": announcement.Status,
		"start_at": announcement.StartAt,
		"end_at": announcement.EndAt,
	}).Error
}
