package repository

import (
	"context"
	"encoding/json"
	"time"

	"devstore/server/internal/model"
	"gorm.io/gorm"
)

type Repository struct{ db *gorm.DB }

func New(db *gorm.DB) *Repository { return &Repository{db: db} }

func (r *Repository) ListActive(ctx context.Context) ([]model.Campaign, error) {
	var items []model.Campaign
	err := r.db.WithContext(ctx).Where("status = 1 AND end_at >= ?", time.Now()).Order("id desc").Find(&items).Error
	return items, err
}

func (r *Repository) ListAll(ctx context.Context) ([]model.Campaign, error) {
	var items []model.Campaign
	err := r.db.WithContext(ctx).Order("id desc").Find(&items).Error
	return items, err
}

func (r *Repository) Create(ctx context.Context, campaign *model.Campaign) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(campaign).Error; err != nil {
			return err
		}
		return syncSeckillCampaign(tx, campaign)
	})
}

func (r *Repository) Update(ctx context.Context, campaign *model.Campaign) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(campaign).Select("Name", "Type", "Status", "StartAt", "EndAt", "Banner", "Rules").Updates(campaign).Error; err != nil {
			return err
		}
		return syncSeckillCampaign(tx, campaign)
	})
}

func (r *Repository) Delete(ctx context.Context, id uint64) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		subQuery := tx.Model(&model.SeckillCampaign{}).Select("id").Where("campaign_id = ?", id)
		if err := tx.Where("seckill_campaign_id IN (?)", subQuery).Delete(&model.SeckillGood{}).Error; err != nil {
			return err
		}
		if err := tx.Where("campaign_id = ?", id).Delete(&model.SeckillCampaign{}).Error; err != nil {
			return err
		}
		return tx.Delete(&model.Campaign{}, id).Error
	})
}

func syncSeckillCampaign(tx *gorm.DB, campaign *model.Campaign) error {
	updates := map[string]interface{}{
		"name":     campaign.Name,
		"status":   campaign.Status,
		"start_at": campaign.StartAt,
		"end_at":   campaign.EndAt,
	}

	if campaign.Type != "seckill" {
		return tx.Model(&model.SeckillCampaign{}).
			Where("campaign_id = ?", campaign.ID).
			Updates(map[string]interface{}{
				"name":     campaign.Name,
				"status":   0,
				"start_at": campaign.StartAt,
				"end_at":   campaign.EndAt,
			}).Error
	}

	res := tx.Model(&model.SeckillCampaign{}).Where("campaign_id = ?", campaign.ID).Updates(updates)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected > 0 {
		return nil
	}

	seckillCampaign := model.SeckillCampaign{
		CampaignID:   campaign.ID,
		Name:         campaign.Name,
		Status:       campaign.Status,
		StartAt:      campaign.StartAt,
		EndAt:        campaign.EndAt,
		LimitPerUser: extractLimitPerUser(campaign.Rules),
	}
	return tx.Create(&seckillCampaign).Error
}

func extractLimitPerUser(rules string) int {
	if rules == "" {
		return 1
	}

	var payload struct {
		LimitPerUser int `json:"limit_per_user"`
	}
	if err := json.Unmarshal([]byte(rules), &payload); err != nil || payload.LimitPerUser <= 0 {
		return 1
	}
	return payload.LimitPerUser
}
