package repository

import (
	"context"
	"fmt"
	"time"

	"devstore/server/internal/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type UserCouponView struct {
	model.UserCoupon
	TemplateName    string  `gorm:"column:template_name" json:"template_name"`
	Amount          float64 `gorm:"column:amount" json:"amount"`
	ThresholdAmount float64 `gorm:"column:threshold_amount" json:"threshold_amount"`
}

type Repository struct{ db *gorm.DB }

func New(db *gorm.DB) *Repository { return &Repository{db: db} }

func (r *Repository) ListTemplates(ctx context.Context) ([]model.CouponTemplate, error) {
	var items []model.CouponTemplate
	err := r.db.WithContext(ctx).Where("status = 1 AND start_at <= ? AND end_at >= ?", time.Now(), time.Now()).Order("id desc").Find(&items).Error
	return items, err
}

func (r *Repository) AdminListTemplates(ctx context.Context) ([]model.CouponTemplate, error) {
	var items []model.CouponTemplate
	err := r.db.WithContext(ctx).Order("id desc").Find(&items).Error
	return items, err
}

func (r *Repository) CreateTemplate(ctx context.Context, tpl *model.CouponTemplate) error {
	return r.db.WithContext(ctx).Create(tpl).Error
}

func (r *Repository) ListUserCoupons(ctx context.Context, userID uint64) ([]UserCouponView, error) {
	var items []UserCouponView
	err := r.db.WithContext(ctx).Table("user_coupons uc").Select("uc.*, ct.name as template_name, ct.amount, ct.threshold_amount").Joins("join coupon_templates ct on ct.id = uc.template_id").Where("uc.user_id = ?", userID).Order("uc.id desc").Find(&items).Error
	return items, err
}

func (r *Repository) Claim(ctx context.Context, userID, templateID uint64) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var tpl model.CouponTemplate
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&tpl, templateID).Error; err != nil {
			return err
		}
		now := time.Now()
		if tpl.Status != 1 || (tpl.EndAt != nil && tpl.EndAt.Before(now)) || (tpl.StartAt != nil && tpl.StartAt.After(now)) {
			return fmt.Errorf("template unavailable")
		}
		var count int64
		if err := tx.Model(&model.UserCoupon{}).Where("user_id = ? AND template_id = ?", userID, templateID).Count(&count).Error; err != nil {
			return err
		}
		if count > 0 {
			return fmt.Errorf("already claimed")
		}
		if tpl.Issued >= tpl.Total {
			return fmt.Errorf("template sold out")
		}
		code := fmt.Sprintf("CPN%d%d", templateID, now.UnixNano())
		coupon := model.UserCoupon{UserID: userID, TemplateID: templateID, CouponCode: code, Status: 10, ReceivedAt: &now, ExpiredAt: tpl.EndAt}
		if err := tx.Create(&coupon).Error; err != nil {
			return err
		}
		return tx.Model(&model.CouponTemplate{}).Where("id = ?", templateID).Update("issued", gorm.Expr("issued + 1")).Error
	})
}
