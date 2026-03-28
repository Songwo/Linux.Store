package repository

import (
	"context"
	"errors"
	"time"

	"devstore/server/internal/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type SKUOrderItem struct {
	model.ProductSKU
	ProductName string `gorm:"column:product_name"`
	Cover       string `gorm:"column:cover"`
	ProductType string `gorm:"column:product_type"`
}

type lockedUserCoupon struct {
	ID              uint64     `gorm:"column:id"`
	UserID          uint64     `gorm:"column:user_id"`
	Status          int8       `gorm:"column:status"`
	ExpiredAt       *time.Time `gorm:"column:expired_at"`
	Amount          float64    `gorm:"column:amount"`
	ThresholdAmount float64    `gorm:"column:threshold_amount"`
	TemplateStatus  int8       `gorm:"column:template_status"`
	StartAt         *time.Time `gorm:"column:start_at"`
	EndAt           *time.Time `gorm:"column:end_at"`
}

type OrderListRow struct {
	model.Order
	Items []model.OrderItem `json:"items"`
}

var (
	ErrCouponUnavailable   = errors.New("coupon unavailable")
	ErrInsufficientBalance = errors.New("insufficient balance")
	ErrInsufficientPoints  = errors.New("insufficient points")
)

type Repository struct{ db *gorm.DB }

func New(db *gorm.DB) *Repository { return &Repository{db: db} }

func (r *Repository) GetSKUForOrder(ctx context.Context, skuID uint64) (*SKUOrderItem, error) {
	var row SKUOrderItem
	err := r.db.WithContext(ctx).Table("product_skus ps").Select("ps.*, p.name as product_name, p.cover, p.type as product_type").Joins("join products p on p.id = ps.product_id").Where("ps.id = ? AND ps.status = 1 AND p.status = 1", skuID).First(&row).Error
	if err != nil {
		return nil, err
	}
	return &row, nil
}

func (r *Repository) CreateOrder(ctx context.Context, order *model.Order, items []model.OrderItem, couponID *uint64) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if couponID != nil {
			discount, lockedCoupon, err := r.lockCouponForOrder(tx, order.UserID, *couponID, order.TotalAmount)
			if err != nil {
				return err
			}
			order.DiscountAmount = discount
			order.PayAmount = order.TotalAmount - discount
			appliedCouponID := lockedCoupon.ID
			order.CouponID = &appliedCouponID
		}

		if err := tx.Create(order).Error; err != nil {
			return err
		}
		for i := range items {
			items[i].OrderID = order.ID
			items[i].OrderNo = order.OrderNo
		}
		if err := tx.Create(&items).Error; err != nil {
			return err
		}
		if err := tx.Create(&model.OrderLog{OrderNo: order.OrderNo, StatusTo: order.Status, OperatorType: "user", OperatorID: &order.UserID, Remark: "create order"}).Error; err != nil {
			return err
		}
		if order.CouponID != nil {
			result := tx.Model(&model.UserCoupon{}).
				Where("id = ? AND user_id = ? AND status = ?", *order.CouponID, order.UserID, 10).
				Updates(map[string]interface{}{"status": 20, "order_no": order.OrderNo})
			if result.Error != nil {
				return result.Error
			}
			if result.RowsAffected == 0 {
				return ErrCouponUnavailable
			}
		}
		return nil
	})
}

func (r *Repository) ListOrders(ctx context.Context, userID uint64, status string) ([]OrderListRow, error) {
	base := r.db.WithContext(ctx).Where("user_id = ?", userID)
	if status != "" && status != "all" {
		base = base.Where("status = ?", status)
	}
	var rows []model.Order
	if err := base.Order("id desc").Find(&rows).Error; err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return []OrderListRow{}, nil
	}

	orderNos := make([]string, 0, len(rows))
	for _, row := range rows {
		orderNos = append(orderNos, row.OrderNo)
	}

	var items []model.OrderItem
	if err := r.db.WithContext(ctx).Where("order_no IN ?", orderNos).Order("id asc").Find(&items).Error; err != nil {
		return nil, err
	}
	itemsByOrderNo := make(map[string][]model.OrderItem, len(rows))
	for _, item := range items {
		itemsByOrderNo[item.OrderNo] = append(itemsByOrderNo[item.OrderNo], item)
	}

	result := make([]OrderListRow, 0, len(rows))
	for _, row := range rows {
		result = append(result, OrderListRow{Order: row, Items: itemsByOrderNo[row.OrderNo]})
	}
	return result, nil
}

func (r *Repository) GetOrderByNo(ctx context.Context, orderNo string) (*model.Order, error) {
	var order model.Order
	if err := r.db.WithContext(ctx).Where("order_no = ?", orderNo).First(&order).Error; err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *Repository) GetOrderItems(ctx context.Context, orderNo string) ([]model.OrderItem, error) {
	var items []model.OrderItem
	err := r.db.WithContext(ctx).Where("order_no = ?", orderNo).Order("id asc").Find(&items).Error
	return items, err
}

func (r *Repository) GetDeliveryRecords(ctx context.Context, orderNo string) ([]model.DeliveryRecord, error) {
	var rows []model.DeliveryRecord
	err := r.db.WithContext(ctx).Where("order_no = ?", orderNo).Order("id asc").Find(&rows).Error
	return rows, err
}

func (r *Repository) UpdateOrderStatus(ctx context.Context, orderNo string, fromStatus, toStatus int8) error {
	return r.db.WithContext(ctx).Model(&model.Order{}).Where("order_no = ? AND status = ?", orderNo, fromStatus).Updates(map[string]interface{}{"status": toStatus}).Error
}

func (r *Repository) CancelOrder(ctx context.Context, order *model.Order) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		now := time.Now()
		result := tx.Model(&model.Order{}).
			Where("order_no = ? AND status = ?", order.OrderNo, 10).
			Updates(map[string]interface{}{"status": 30, "closed_at": &now})
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			return gorm.ErrRecordNotFound
		}
		if err := tx.Create(&model.OrderLog{OrderNo: order.OrderNo, StatusFrom: &order.Status, StatusTo: 30, OperatorType: "user", OperatorID: &order.UserID, Remark: "cancel order"}).Error; err != nil {
			return err
		}
		if order.CouponID != nil {
			if err := r.releaseCoupon(tx, *order.CouponID, order.OrderNo); err != nil {
				return err
			}
		}
		if order.OrderType == "seckill" && order.CampaignID != nil {
			var items []model.OrderItem
			if err := tx.Where("order_no = ?", order.OrderNo).Find(&items).Error; err != nil {
				return err
			}
			for _, item := range items {
				if err := tx.Model(&model.SeckillGood{}).
					Where("seckill_campaign_id = ? AND sku_id = ?", *order.CampaignID, item.SKUID).
					UpdateColumn("available_stock", gorm.Expr("CASE WHEN available_stock + ? > stock THEN stock ELSE available_stock + ? END", item.Quantity, item.Quantity)).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
}

func (r *Repository) lockCouponForOrder(tx *gorm.DB, userID, couponID uint64, totalAmount float64) (float64, *lockedUserCoupon, error) {
	var coupon lockedUserCoupon
	err := tx.Table("user_coupons uc").
		Clauses(clause.Locking{Strength: "UPDATE"}).
		Select("uc.id, uc.user_id, uc.status, uc.expired_at, ct.amount, ct.threshold_amount, ct.status as template_status, ct.start_at, ct.end_at").
		Joins("join coupon_templates ct on ct.id = uc.template_id").
		Where("uc.id = ? AND uc.user_id = ?", couponID, userID).
		First(&coupon).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, nil, ErrCouponUnavailable
		}
		return 0, nil, err
	}

	now := time.Now()
	if coupon.Status != 10 || coupon.TemplateStatus != 1 {
		return 0, nil, ErrCouponUnavailable
	}
	if (coupon.ExpiredAt != nil && coupon.ExpiredAt.Before(now)) || (coupon.StartAt != nil && coupon.StartAt.After(now)) || (coupon.EndAt != nil && coupon.EndAt.Before(now)) {
		return 0, nil, ErrCouponUnavailable
	}
	if totalAmount < coupon.ThresholdAmount {
		return 0, nil, ErrCouponUnavailable
	}

	discount := coupon.Amount
	if discount > totalAmount {
		discount = totalAmount
	}
	return discount, &coupon, nil
}

func (r *Repository) releaseCoupon(tx *gorm.DB, couponID uint64, orderNo string) error {
	return tx.Model(&model.UserCoupon{}).
		Where("id = ? AND order_no = ? AND status = ?", couponID, orderNo, 20).
		Updates(map[string]interface{}{"status": 10, "order_no": "", "used_at": nil}).Error
}
