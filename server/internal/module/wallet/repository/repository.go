package repository

import (
	"context"
	"strings"
	"time"

	"devstore/server/internal/model"
	"gorm.io/gorm"
)

type WalletFlowItem struct {
	Type        string    `json:"type"`
	BizType     string    `json:"biz_type"`
	BizNo       string    `json:"biz_no"`
	Direction   int8      `json:"direction"`
	Amount      float64   `json:"amount"`
	Points      int64     `json:"points"`
	Description string    `json:"description"`
	CreatedAt   *time.Time `json:"created_at"`
}

type WalletSummary struct {
	Balance         float64 `json:"balance"`
	Points          int64   `json:"points"`
	TotalIncome     float64 `json:"total_income"`
	TotalExpense    float64 `json:"total_expense"`
	SignRewardTotal int64   `json:"sign_reward_total"`
	SignDays        int64   `json:"sign_days"`
}

type Repository struct{ db *gorm.DB }

func New(db *gorm.DB) *Repository { return &Repository{db: db} }

func (r *Repository) Summary(ctx context.Context, userID uint64) (*WalletSummary, error) {
	var summary WalletSummary
	if err := r.db.WithContext(ctx).Table("user_balance_accounts").Select("COALESCE(balance, 0) as balance").Where("user_id = ?", userID).Scan(&summary).Error; err != nil {
		return nil, err
	}
	var points model.UserPointsAccount
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).First(&points).Error; err == nil {
		summary.Points = points.Points
	}
	var income struct{ Amount float64 }
	var expense struct{ Amount float64 }
	var signReward struct{ Points int64 }
	var signDays int64
	_ = r.db.WithContext(ctx).Table("user_balance_flows").Select("COALESCE(SUM(amount),0) as amount").Where("user_id = ? AND direction = 1", userID).Scan(&income).Error
	_ = r.db.WithContext(ctx).Table("user_balance_flows").Select("COALESCE(SUM(amount),0) as amount").Where("user_id = ? AND direction = 2", userID).Scan(&expense).Error
	_ = r.db.WithContext(ctx).Table("user_sign_records").Select("COALESCE(SUM(reward_points),0) as points").Where("user_id = ?", userID).Scan(&signReward).Error
	_ = r.db.WithContext(ctx).Model(&model.UserSignRecord{}).Where("user_id = ?", userID).Count(&signDays).Error
		summary.TotalIncome = income.Amount
		summary.TotalExpense = expense.Amount
		summary.SignRewardTotal = signReward.Points
		summary.SignDays = signDays
	return &summary, nil
}

func (r *Repository) ListFlows(ctx context.Context, userID uint64, bizType, flowType, dateFrom, dateTo string, page, pageSize int) ([]WalletFlowItem, int64, error) {
	if page <= 0 { page = 1 }
	if pageSize <= 0 || pageSize > 100 { pageSize = 10 }
	rows := make([]WalletFlowItem, 0)
	query := r.db.WithContext(ctx).Raw(`
SELECT * FROM (
  SELECT 'balance' AS type, biz_type, biz_no, direction, amount, 0 AS points, remark AS description, created_at
  FROM user_balance_flows WHERE user_id = ?
  UNION ALL
  SELECT 'points' AS type, biz_type, biz_no, direction, 0 AS amount, points, remark AS description, created_at
  FROM user_points_flows WHERE user_id = ?
) t
WHERE (? = '' OR biz_type = ?)
AND (? = 'all' OR (? = 'income' AND direction = 1) OR (? = 'expense' AND direction = 2))
AND (? = '' OR created_at >= ?)
AND (? = '' OR created_at <= ?)
ORDER BY created_at DESC
LIMIT ? OFFSET ?`, userID, userID, bizType, bizType, flowType, flowType, flowType, dateFrom, dateFrom, dateTo, dateTo, pageSize, (page-1)*pageSize)
	if err := query.Scan(&rows).Error; err != nil { return nil, 0, err }
	var count int64
	countSQL := `
SELECT COUNT(1) AS total FROM (
  SELECT biz_type, direction, created_at FROM user_balance_flows WHERE user_id = ?
  UNION ALL
  SELECT biz_type, direction, created_at FROM user_points_flows WHERE user_id = ?
) t
WHERE (? = '' OR biz_type = ?)
AND (? = 'all' OR (? = 'income' AND direction = 1) OR (? = 'expense' AND direction = 2))
AND (? = '' OR created_at >= ?)
AND (? = '' OR created_at <= ?)`
	if err := r.db.WithContext(ctx).Raw(countSQL, userID, userID, bizType, bizType, flowType, flowType, flowType, dateFrom, dateFrom, dateTo, dateTo).Scan(&count).Error; err != nil { return nil, 0, err }
	return rows, count, nil
}

func normalizeFilter(v string) string { return strings.TrimSpace(v) }
