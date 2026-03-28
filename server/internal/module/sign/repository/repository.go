package repository

import (
	"context"
	"time"

	"devstore/server/internal/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Repository struct{ db *gorm.DB }

func New(db *gorm.DB) *Repository { return &Repository{db: db} }

func (r *Repository) GetTodayRecord(ctx context.Context, userID uint64, date time.Time) (*model.UserSignRecord, error) {
	var record model.UserSignRecord
	if err := r.db.WithContext(ctx).Where("user_id = ? AND sign_date = ?", userID, date.Format("2006-01-02")).First(&record).Error; err != nil {
		return nil, err
	}
	return &record, nil
}

func (r *Repository) GetLatestRecord(ctx context.Context, userID uint64) (*model.UserSignRecord, error) {
	var record model.UserSignRecord
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("sign_date desc").First(&record).Error; err != nil {
		return nil, err
	}
	return &record, nil
}

func (r *Repository) ListHistory(ctx context.Context, userID uint64, from, to time.Time) ([]model.UserSignRecord, error) {
	var rows []model.UserSignRecord
	err := r.db.WithContext(ctx).Where("user_id = ? AND sign_date >= ? AND sign_date <= ?", userID, from.Format("2006-01-02"), to.Format("2006-01-02")).Order("sign_date desc").Find(&rows).Error
	return rows, err
}

func (r *Repository) Sign(ctx context.Context, userID uint64, signDate time.Time, streak int, reward int64) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var pointsAccount model.UserPointsAccount
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("user_id = ?", userID).First(&pointsAccount).Error; err != nil {
			return err
		}
		var balanceAccount model.UserBalanceAccount
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("user_id = ?", userID).First(&balanceAccount).Error; err != nil {
			return err
		}
		record := model.UserSignRecord{UserID: userID, SignDate: &signDate, StreakDays: streak, RewardPoints: reward}
		if err := tx.Create(&record).Error; err != nil {
			return err
		}
		newPoints := pointsAccount.Points + reward
		newBalance := balanceAccount.Balance + float64(reward)
		if err := tx.Model(&model.UserPointsAccount{}).Where("user_id = ?", userID).Updates(map[string]interface{}{"points": newPoints, "total_points": pointsAccount.TotalPoints + reward, "version": gorm.Expr("version + 1")}).Error; err != nil {
			return err
		}
		if err := tx.Model(&model.UserBalanceAccount{}).Where("user_id = ?", userID).Updates(map[string]interface{}{"balance": newBalance, "version": gorm.Expr("version + 1")}).Error; err != nil {
			return err
		}
		pointsFlow := model.UserPointsFlow{UserID: userID, BizType: "sign", BizNo: signDate.Format("20060102"), Direction: 1, Points: reward, PointsAfter: newPoints, Remark: "daily sign reward"}
		if err := tx.Create(&pointsFlow).Error; err != nil {
			return err
		}
		balanceFlow := model.UserBalanceFlow{UserID: userID, BizType: "sign_bonus", BizNo: signDate.Format("20060102"), Direction: 1, Amount: float64(reward), BalanceAfter: newBalance, Remark: "sign reward synced to wallet"}
		if err := tx.Create(&balanceFlow).Error; err != nil {
			return err
		}
		return nil
	})
}
