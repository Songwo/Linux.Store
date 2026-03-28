package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"devstore/server/internal/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Repository struct{ db *gorm.DB }

func New(db *gorm.DB) *Repository { return &Repository{db: db} }

func (r *Repository) GetByUsername(ctx context.Context, username string) (*model.AdminUser, error) {
	var admin model.AdminUser
	if err := r.db.WithContext(ctx).Where("username = ?", username).First(&admin).Error; err != nil {
		return nil, err
	}
	return &admin, nil
}

type DashboardStats struct {
	UserCount         int64   `json:"user_count"`
	OrderCount        int64   `json:"order_count"`
	GMV               float64 `json:"gmv"`
	CampaignCount     int64   `json:"campaign_count"`
	TodayPaidCount    int64   `json:"today_paid_count"`
	PendingPayCount   int64   `json:"pending_pay_count"`
	SeckillOrderCount int64   `json:"seckill_order_count"`
}

type UserListItem struct {
	ID        uint64     `json:"id"`
	Nickname  string     `json:"nickname"`
	Email     string     `json:"email"`
	Balance   float64    `json:"balance"`
	Points    int64      `json:"points"`
	Source    string     `json:"source"`
	Status    int8       `json:"status"`
	CreatedAt *time.Time `json:"created_at"`
}

type OrderListItem struct {
	OrderNo     string     `json:"order_no"`
	UserID      uint64     `json:"user_id"`
	Nickname    string     `json:"nickname"`
	Email       string     `json:"email"`
	OrderType   string     `json:"order_type"`
	Status      int8       `json:"status"`
	TotalAmount float64    `json:"total_amount"`
	PayAmount   float64    `json:"pay_amount"`
	CreatedAt   *time.Time `json:"created_at"`
	PaidAt      *time.Time `json:"paid_at"`
}

type AdminOrderUser struct {
	ID       uint64 `json:"id"`
	Nickname string `json:"nickname"`
	Email    string `json:"email"`
}

type InventoryListItem struct {
	ID             uint64     `json:"id"`
	ProductID      uint64     `json:"product_id"`
	SKUID          uint64     `json:"sku_id"`
	ProductName    string     `json:"product_name"`
	SKUTitle       string     `json:"sku_title"`
	SKUCode        string     `json:"sku_code"`
	TotalStock     int64      `json:"total_stock"`
	AvailableStock int64      `json:"available_stock"`
	ReservedStock  int64      `json:"reserved_stock"`
	Status         int8       `json:"status"`
	UpdatedAt      *time.Time `json:"updated_at"`
}

type BalanceFlowListItem struct {
	ID           uint64     `json:"id"`
	UserID       uint64     `json:"user_id"`
	Nickname     string     `json:"nickname"`
	Email        string     `json:"email"`
	BizType      string     `json:"biz_type"`
	BizNo        string     `json:"biz_no"`
	Direction    int8       `json:"direction"`
	Amount       float64    `json:"amount"`
	BalanceAfter float64    `json:"balance_after"`
	Remark       string     `json:"remark"`
	CreatedAt    *time.Time `json:"created_at"`
}

type PointsFlowListItem struct {
	ID          uint64     `json:"id"`
	UserID      uint64     `json:"user_id"`
	Nickname    string     `json:"nickname"`
	Email       string     `json:"email"`
	BizType     string     `json:"biz_type"`
	BizNo       string     `json:"biz_no"`
	Direction   int8       `json:"direction"`
	Points      int64      `json:"points"`
	PointsAfter int64      `json:"points_after"`
	Remark      string     `json:"remark"`
	CreatedAt   *time.Time `json:"created_at"`
}

type OperationLogListItem struct {
	ID           uint64     `json:"id"`
	OperatorID   *uint64    `json:"operator_id,omitempty"`
	OperatorType string     `json:"operator_type"`
	Module       string     `json:"module"`
	Action       string     `json:"action"`
	BizNo        string     `json:"biz_no"`
	Method       string     `json:"method"`
	Path         string     `json:"path"`
	IP           string     `json:"ip"`
	RequestBody  string     `json:"request_body"`
	ResponseBody string     `json:"response_body"`
	CreatedAt    *time.Time `json:"created_at"`
}

func (r *Repository) GetDashboardStats(ctx context.Context) (*DashboardStats, error) {
	stats := &DashboardStats{}
	if err := r.db.WithContext(ctx).Model(&model.User{}).Count(&stats.UserCount).Error; err != nil {
		return nil, err
	}
	if err := r.db.WithContext(ctx).Model(&model.Order{}).Count(&stats.OrderCount).Error; err != nil {
		return nil, err
	}
	if err := r.db.WithContext(ctx).Model(&model.Campaign{}).Count(&stats.CampaignCount).Error; err != nil {
		return nil, err
	}
	if err := r.db.WithContext(ctx).Model(&model.Order{}).Where("status = ?", 10).Count(&stats.PendingPayCount).Error; err != nil {
		return nil, err
	}
	if err := r.db.WithContext(ctx).Model(&model.Order{}).Where("order_type = ?", "seckill").Count(&stats.SeckillOrderCount).Error; err != nil {
		return nil, err
	}
	type amountResult struct {
		Amount float64 `gorm:"column:amount"`
	}
	var gmv amountResult
	if err := r.db.WithContext(ctx).Model(&model.Order{}).Select("COALESCE(SUM(pay_amount), 0) AS amount").Where("status IN ?", []int{20, 50}).Scan(&gmv).Error; err != nil {
		return nil, err
	}
	stats.GMV = gmv.Amount
	now := time.Now()
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	if err := r.db.WithContext(ctx).Model(&model.Order{}).Where("status IN ? AND paid_at >= ?", []int{20, 50}, todayStart).Count(&stats.TodayPaidCount).Error; err != nil {
		return nil, err
	}
	return stats, nil
}

func (r *Repository) ListUsers(ctx context.Context, keyword string, page, pageSize int) ([]UserListItem, int64, error) {
	page, pageSize = normalizePage(page, pageSize)
	base := r.db.WithContext(ctx).Table("users u").
		Select("u.id, u.nickname, COALESCE(u.email, '') as email, COALESCE(uba.balance, 0) as balance, COALESCE(upa.points, 0) as points, u.source, u.status, u.created_at").
		Joins("left join user_balance_accounts uba on uba.user_id = u.id").
		Joins("left join user_points_accounts upa on upa.user_id = u.id")
	if keyword = strings.TrimSpace(keyword); keyword != "" {
		like := "%" + keyword + "%"
		base = base.Where("u.nickname like ? OR u.email like ?", like, like)
	}
	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var rows []UserListItem
	err := base.Order("u.id desc").Offset((page - 1) * pageSize).Limit(pageSize).Find(&rows).Error
	return rows, total, err
}

func (r *Repository) ListOrders(ctx context.Context, status, keyword string, page, pageSize int) ([]OrderListItem, int64, error) {
	page, pageSize = normalizePage(page, pageSize)
	base := r.db.WithContext(ctx).Table("orders o").
		Select("o.order_no, o.user_id, COALESCE(u.nickname, '') as nickname, COALESCE(u.email, '') as email, o.order_type, o.status, o.total_amount, o.pay_amount, o.created_at, o.paid_at").
		Joins("left join users u on u.id = o.user_id")
	if strings.TrimSpace(status) != "" && status != "all" {
		base = base.Where("o.status = ?", status)
	}
	if kw := strings.TrimSpace(keyword); kw != "" {
		like := "%" + kw + "%"
		base = base.Where("o.order_no like ? OR u.nickname like ? OR u.email like ?", like, like, like)
	}
	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var rows []OrderListItem
	err := base.Order("o.id desc").Offset((page - 1) * pageSize).Limit(pageSize).Find(&rows).Error
	return rows, total, err
}

type InventoryAdjustResult struct {
	SkuID          uint64 `json:"sku_id"`
	AvailableStock int64  `json:"available_stock"`
}

func (r *Repository) AdjustInventory(ctx context.Context, skuID uint64, delta int64) (*InventoryAdjustResult, error) {
	var result InventoryAdjustResult
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var inv struct {
			ID             uint64 `gorm:"column:id"`
			AvailableStock int64  `gorm:"column:available_stock"`
		}
		if err := tx.Raw("SELECT id, available_stock FROM inventories WHERE sku_id = ? FOR UPDATE", skuID).Scan(&inv).Error; err != nil {
			return err
		}
		if inv.ID == 0 {
			return fmt.Errorf("inventory not found for sku_id %d", skuID)
		}
		newStock := inv.AvailableStock + delta
		if newStock < 0 {
			return fmt.Errorf("available stock would be negative")
		}
		if err := tx.Exec("UPDATE inventories SET available_stock = ?, updated_at = NOW() WHERE sku_id = ?", newStock, skuID).Error; err != nil {
			return err
		}
		if err := tx.Exec("UPDATE product_skus SET stock = ?, updated_at = NOW() WHERE id = ?", newStock, skuID).Error; err != nil {
			return err
		}
		result = InventoryAdjustResult{SkuID: skuID, AvailableStock: newStock}
		return nil
	})
	return &result, err
}

func (r *Repository) GetOrderDetail(ctx context.Context, orderNo string) (*model.Order, *AdminOrderUser, []model.OrderItem, []model.DeliveryRecord, error) {
	var order model.Order
	if err := r.db.WithContext(ctx).Where("order_no = ?", orderNo).First(&order).Error; err != nil {
		return nil, nil, nil, nil, err
	}
	var user AdminOrderUser
	if err := r.db.WithContext(ctx).Table("users").Select("id, nickname, COALESCE(email, '') as email").Where("id = ?", order.UserID).First(&user).Error; err != nil {
		return nil, nil, nil, nil, err
	}
	var items []model.OrderItem
	if err := r.db.WithContext(ctx).Where("order_no = ?", orderNo).Order("id asc").Find(&items).Error; err != nil {
		return nil, nil, nil, nil, err
	}
	var deliveries []model.DeliveryRecord
	if err := r.db.WithContext(ctx).Where("order_no = ?", orderNo).Order("id asc").Find(&deliveries).Error; err != nil {
		return nil, nil, nil, nil, err
	}
	return &order, &user, items, deliveries, nil
}

func (r *Repository) AdjustUserWallet(ctx context.Context, userID uint64, amount float64, remark string, operatorID uint64) (*model.UserBalanceAccount, error) {
	var account model.UserBalanceAccount
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("user_id = ?", userID).Attrs(model.UserBalanceAccount{UserID: userID, Balance: 0, FrozenBalance: 0, Version: 0}).FirstOrCreate(&account).Error; err != nil {
			return err
		}
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("user_id = ?", userID).First(&account).Error; err != nil {
			return err
		}
		newBalance := account.Balance + amount
		if newBalance < 0 {
			return fmt.Errorf("insufficient balance")
		}
		if err := tx.Model(&model.UserBalanceAccount{}).Where("user_id = ?", userID).Updates(map[string]interface{}{"balance": newBalance, "version": gorm.Expr("version + 1")}).Error; err != nil {
			return err
		}
		direction := int8(1)
		if amount < 0 {
			direction = 2
		}
		flow := model.UserBalanceFlow{
			UserID:       userID,
			BizType:      "admin_adjust",
			BizNo:        fmt.Sprintf("ADMIN-%d-%d", operatorID, time.Now().UnixNano()),
			Direction:    direction,
			Amount:       abs(amount),
			BalanceAfter: newBalance,
			Remark:       strings.TrimSpace(remark),
		}
		if flow.Remark == "" {
			flow.Remark = "admin adjust wallet"
		}
		if err := tx.Create(&flow).Error; err != nil {
			return err
		}
		account.Balance = newBalance
		return nil
	})
	if err != nil {
		return nil, err
	}
	return &account, nil
}

func (r *Repository) ListInventory(ctx context.Context, keyword string, page, pageSize int) ([]InventoryListItem, int64, error) {
	page, pageSize = normalizePage(page, pageSize)
	base := r.db.WithContext(ctx).Table("inventories i").
		Select("i.id, i.product_id, i.sku_id, p.name as product_name, ps.title as sku_title, ps.sku_code, ps.stock as total_stock, CASE WHEN i.available_stock > ps.stock THEN ps.stock ELSE i.available_stock END as available_stock, CASE WHEN i.available_stock > ps.stock THEN 0 ELSE i.reserved_stock END as reserved_stock, ps.status, i.updated_at").
		Joins("join products p on p.id = i.product_id").
		Joins("join product_skus ps on ps.id = i.sku_id")
	if keyword = strings.TrimSpace(keyword); keyword != "" {
		like := "%" + keyword + "%"
		base = base.Where("p.name like ? OR ps.sku_code like ? OR ps.title like ?", like, like, like)
	}
	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var rows []InventoryListItem
	err := base.Order("i.id desc").Offset((page - 1) * pageSize).Limit(pageSize).Find(&rows).Error
	return rows, total, err
}

func (r *Repository) ListBalanceFlows(ctx context.Context, userID uint64, page, pageSize int) ([]BalanceFlowListItem, int64, error) {
	page, pageSize = normalizePage(page, pageSize)
	base := r.db.WithContext(ctx).Table("user_balance_flows ubf").
		Select("ubf.id, ubf.user_id, COALESCE(u.nickname, '') as nickname, COALESCE(u.email, '') as email, ubf.biz_type, ubf.biz_no, ubf.direction, ubf.amount, ubf.balance_after, ubf.remark, ubf.created_at").
		Joins("left join users u on u.id = ubf.user_id")
	if userID > 0 {
		base = base.Where("ubf.user_id = ?", userID)
	}
	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var rows []BalanceFlowListItem
	err := base.Order("ubf.id desc").Offset((page - 1) * pageSize).Limit(pageSize).Find(&rows).Error
	return rows, total, err
}

func (r *Repository) ListPointsFlows(ctx context.Context, userID uint64, page, pageSize int) ([]PointsFlowListItem, int64, error) {
	page, pageSize = normalizePage(page, pageSize)
	base := r.db.WithContext(ctx).Table("user_points_flows upf").
		Select("upf.id, upf.user_id, COALESCE(u.nickname, '') as nickname, COALESCE(u.email, '') as email, upf.biz_type, upf.biz_no, upf.direction, upf.points, upf.points_after, upf.remark, upf.created_at").
		Joins("left join users u on u.id = upf.user_id")
	if userID > 0 {
		base = base.Where("upf.user_id = ?", userID)
	}
	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var rows []PointsFlowListItem
	err := base.Order("upf.id desc").Offset((page - 1) * pageSize).Limit(pageSize).Find(&rows).Error
	return rows, total, err
}

func (r *Repository) ListOperationLogs(ctx context.Context, module string, page, pageSize int) ([]OperationLogListItem, int64, error) {
	page, pageSize = normalizePage(page, pageSize)
	base := r.db.WithContext(ctx).Table("operation_logs")
	if module = strings.TrimSpace(module); module != "" {
		base = base.Where("module = ?", module)
	}
	var total int64
	if err := base.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var rows []OperationLogListItem
	err := base.Order("id desc").Offset((page - 1) * pageSize).Limit(pageSize).Find(&rows).Error
	return rows, total, err
}

func normalizePage(page, pageSize int) (int, int) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 10
	}
	return page, pageSize
}

func abs(value float64) float64 {
	if value < 0 {
		return -value
	}
	return value
}
