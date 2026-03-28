package repository

import (
	"context"
	"time"

	"devstore/server/internal/model"
	"gorm.io/gorm"
)

type ProfileAggregate struct {
	model.User
	Balance float64 `gorm:"column:balance"`
	Points  int64   `gorm:"column:points"`
}

type RecentOrderItem struct {
	OrderNo   string     `json:"order_no"`
	OrderType string     `json:"order_type"`
	Status    int8       `json:"status"`
	PayAmount float64    `json:"pay_amount"`
	CreatedAt *time.Time  `json:"created_at"`
	PaidAt    *time.Time `json:"paid_at"`
}

type RecentFlowItem struct {
	Type      string    `json:"type"`
	BizType   string    `json:"biz_type"`
	Direction int8      `json:"direction"`
	Amount    float64   `json:"amount"`
	Points    int64     `json:"points"`
	Remark    string    `json:"remark"`
	CreatedAt *time.Time `json:"created_at"`
}

type OAuthBindingItem struct {
	Provider         string    `json:"provider"`
	ProviderUsername string    `json:"provider_username"`
	CreatedAt        *time.Time `json:"created_at"`
}

type Repository struct{ db *gorm.DB }

func New(db *gorm.DB) *Repository { return &Repository{db: db} }

func (r *Repository) GetProfile(ctx context.Context, userID uint64) (*ProfileAggregate, error) {
	var profile ProfileAggregate
	err := r.db.WithContext(ctx).Table("users u").Select("u.*, uba.balance, upa.points").Joins("left join user_balance_accounts uba on uba.user_id = u.id").Joins("left join user_points_accounts upa on upa.user_id = u.id").Where("u.id = ?", userID).First(&profile).Error
	if err != nil {
		return nil, err
	}
	return &profile, nil
}

func (r *Repository) HasSignedToday(ctx context.Context, userID uint64) (bool, error) {
	var count int64
	today := time.Now().Format("2006-01-02")
	err := r.db.WithContext(ctx).Model(&model.UserSignRecord{}).Where("user_id = ? AND sign_date = ?", userID, today).Count(&count).Error
	return count > 0, err
}

func (r *Repository) GetCenterStats(ctx context.Context, userID uint64) (map[string]interface{}, error) {
	profile, err := r.GetProfile(ctx, userID)
	if err != nil {
		return nil, err
	}
	var signDays int64
	var spend struct{ Amount float64 }
	var wishlistCount int64
	_ = r.db.WithContext(ctx).Model(&model.UserSignRecord{}).Where("user_id = ?", userID).Count(&signDays).Error
	_ = r.db.WithContext(ctx).Table("user_balance_flows").Select("COALESCE(SUM(amount), 0) as amount").Where("user_id = ? AND direction = 2", userID).Scan(&spend).Error
	_ = r.db.WithContext(ctx).Model(&model.UserWishlist{}).Where("user_id = ?", userID).Count(&wishlistCount).Error
	recentOrders := make([]RecentOrderItem, 0)
	_ = r.db.WithContext(ctx).Table("orders").Select("order_no, order_type, status, pay_amount, created_at, paid_at").Where("user_id = ?", userID).Order("id desc").Limit(5).Find(&recentOrders).Error
	recentFlows := make([]RecentFlowItem, 0)
	_ = r.db.WithContext(ctx).Raw(`
SELECT * FROM (
  SELECT 'balance' AS type, biz_type, direction, amount, 0 AS points, remark, created_at FROM user_balance_flows WHERE user_id = ?
  UNION ALL
  SELECT 'points' AS type, biz_type, direction, 0 AS amount, points, remark, created_at FROM user_points_flows WHERE user_id = ?
) t ORDER BY created_at DESC LIMIT 6`, userID, userID).Scan(&recentFlows).Error
	email := ""
	if profile.Email != nil { email = *profile.Email }
	bindings := make([]OAuthBindingItem, 0)
	_ = r.db.WithContext(ctx).Table("oauth_bindings").Select("provider, provider_username, created_at").Where("user_id = ?", userID).Find(&bindings).Error
	
	return map[string]interface{}{
		"user": map[string]interface{}{"id": profile.ID, "email": email, "nickname": profile.Nickname, "avatar": profile.Avatar, "source": profile.Source, "created_at": profile.CreatedAt},
		"wallet": map[string]interface{}{"balance": profile.Balance, "points": profile.Points},
		"stats": map[string]interface{}{"sign_days": signDays, "total_spend": spend.Amount, "wishlist_count": wishlistCount},
		"recent_orders": recentOrders,
		"recent_flows": recentFlows,
		"oauth_bindings": bindings,
	}, nil
}
