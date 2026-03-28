package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"devstore/server/internal/model"
	cardsecretrepo "devstore/server/internal/module/cardsecret/repository"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var (
	ErrInsufficientBalance      = errors.New("insufficient balance")
	ErrInsufficientPoints       = errors.New("insufficient points")
	ErrPaymentDuplicate         = errors.New("payment duplicate")
	ErrStockNotEnough           = errors.New("stock not enough")
	ErrCardSecretStockNotEnough = errors.New("card secret stock not enough")
)

type Repository struct {
	db          *gorm.DB
	cardSecrets *cardsecretrepo.Repository
}

func New(db *gorm.DB, cardSecretRepo *cardsecretrepo.Repository) *Repository {
	return &Repository{db: db, cardSecrets: cardSecretRepo}
}

func (r *Repository) BalancePay(ctx context.Context, order *model.Order, payOrder *model.PaymentOrder) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var lockedOrder model.Order
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("order_no = ? AND user_id = ?", order.OrderNo, order.UserID).First(&lockedOrder).Error; err != nil {
			return err
		}
		if lockedOrder.Status != 10 {
			return ErrPaymentDuplicate
		}

		var account model.UserBalanceAccount
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("user_id = ?", lockedOrder.UserID).First(&account).Error; err != nil {
			return err
		}
		if account.Balance < lockedOrder.PayAmount {
			return ErrInsufficientBalance
		}

		var pointsAccount model.UserPointsAccount
		if lockedOrder.PointsAmount > 0 {
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("user_id = ?", lockedOrder.UserID).First(&pointsAccount).Error; err != nil {
				return err
			}
			if pointsAccount.Points < lockedOrder.PointsAmount {
				return ErrInsufficientPoints
			}
		}

		if err := tx.Create(payOrder).Error; err != nil {
			return err
		}

		var items []model.OrderItem
		if err := tx.Where("order_no = ?", lockedOrder.OrderNo).Order("id asc").Find(&items).Error; err != nil {
			return err
		}
		now := time.Now()
		for _, item := range items {
			if err := r.consumeInventory(tx, item); err != nil {
				return err
			}
			content := buildDeliveryContent(lockedOrder.OrderNo, item)
			if r.cardSecrets != nil {
				hasCardSecret, assignedCards, err := r.cardSecrets.AllocateForOrderItem(tx, &lockedOrder, item)
				if err != nil {
					if errors.Is(err, cardsecretrepo.ErrCardSecretStockNotEnough) {
						return ErrCardSecretStockNotEnough
					}
					return err
				}
				if hasCardSecret {
					content = buildCardSecretDeliveryContent(item, len(assignedCards))
				}
			}
			record := model.DeliveryRecord{
				OrderNo:      lockedOrder.OrderNo,
				OrderItemID:  item.ID,
				UserID:       lockedOrder.UserID,
				ProductID:    item.ProductID,
				SKUID:        item.SKUID,
				DeliveryType: "auto",
				Content:      content,
				Status:       20,
				DeliveredAt:  &now,
			}
			if err := tx.Create(&record).Error; err != nil {
				return err
			}
		}

		newBalance := account.Balance - lockedOrder.PayAmount
		if err := tx.Model(&model.UserBalanceAccount{}).Where("user_id = ?", lockedOrder.UserID).Updates(map[string]interface{}{"balance": newBalance, "version": gorm.Expr("version + 1")}).Error; err != nil {
			return err
		}
		flow := model.UserBalanceFlow{UserID: lockedOrder.UserID, BizType: "pay", BizNo: lockedOrder.OrderNo, Direction: 2, Amount: lockedOrder.PayAmount, BalanceAfter: newBalance, Remark: "balance pay order"}
		if err := tx.Create(&flow).Error; err != nil {
			return err
		}

		if lockedOrder.PointsAmount > 0 {
			newPoints := pointsAccount.Points - lockedOrder.PointsAmount
			if err := tx.Model(&model.UserPointsAccount{}).Where("user_id = ?", lockedOrder.UserID).Updates(map[string]interface{}{"points": newPoints, "used_points": pointsAccount.UsedPoints + lockedOrder.PointsAmount, "version": gorm.Expr("version + 1")}).Error; err != nil {
				return err
			}
			pointsFlow := model.UserPointsFlow{UserID: lockedOrder.UserID, BizType: "pay_points", BizNo: lockedOrder.OrderNo, Direction: 2, Points: lockedOrder.PointsAmount, PointsAfter: newPoints, Remark: "points pay order"}
			if err := tx.Create(&pointsFlow).Error; err != nil {
				return err
			}
		}

		payload, _ := json.Marshal(map[string]interface{}{"pay_no": payOrder.PayNo, "order_no": lockedOrder.OrderNo, "amount": lockedOrder.PayAmount, "points_amount": lockedOrder.PointsAmount, "channel": "balance"})
		paymentFlow := model.PaymentFlow{PayNo: payOrder.PayNo, OrderNo: lockedOrder.OrderNo, UserID: lockedOrder.UserID, Channel: "balance", EventType: "paid", RawPayload: string(payload)}
		if err := tx.Create(&paymentFlow).Error; err != nil {
			return err
		}

		result := tx.Model(&model.Order{}).Where("order_no = ? AND status = ?", lockedOrder.OrderNo, 10).Updates(map[string]interface{}{"status": 50, "paid_at": &now})
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			return ErrPaymentDuplicate
		}
		if lockedOrder.CouponID != nil {
			if err := tx.Model(&model.UserCoupon{}).
				Where("id = ? AND order_no = ? AND status = ?", *lockedOrder.CouponID, lockedOrder.OrderNo, 20).
				Updates(map[string]interface{}{"status": 30, "used_at": &now}).Error; err != nil {
				return err
			}
		}
		if err := tx.Model(&model.PaymentOrder{}).Where("pay_no = ?", payOrder.PayNo).Updates(map[string]interface{}{"status": 20, "paid_at": &now}).Error; err != nil {
			return err
		}
		fromStatus := lockedOrder.Status
		orderLog := model.OrderLog{OrderNo: lockedOrder.OrderNo, StatusFrom: &fromStatus, StatusTo: 50, OperatorType: "user", OperatorID: &lockedOrder.UserID, Remark: "balance payment completed"}
		if err := tx.Create(&orderLog).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *Repository) GetOrderByNo(ctx context.Context, orderNo string) (*model.Order, error) {
	var order model.Order
	if err := r.db.WithContext(ctx).Where("order_no = ?", orderNo).First(&order).Error; err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *Repository) consumeInventory(tx *gorm.DB, item model.OrderItem) error {
	updates := map[string]interface{}{"stock": gorm.Expr("stock - ?", item.Quantity)}
	result := tx.Model(&model.ProductSKU{}).Where("id = ? AND stock >= ?", item.SKUID, item.Quantity).Updates(updates)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrStockNotEnough
	}

	invResult := tx.Model(&model.Inventory{}).Where("sku_id = ? AND available_stock >= ? AND total_stock >= ?", item.SKUID, item.Quantity, item.Quantity).Updates(map[string]interface{}{"total_stock": gorm.Expr("total_stock - ?", item.Quantity), "available_stock": gorm.Expr("available_stock - ?", item.Quantity), "version": gorm.Expr("version + 1")})
	if invResult.Error != nil {
		return invResult.Error
	}
	if invResult.RowsAffected == 0 {
		return ErrStockNotEnough
	}

	productResult := tx.Model(&model.Product{}).Where("id = ? AND stock >= ?", item.ProductID, item.Quantity).Updates(map[string]interface{}{"stock": gorm.Expr("stock - ?", item.Quantity), "sales_count": gorm.Expr("sales_count + ?", item.Quantity)})
	if productResult.Error != nil {
		return productResult.Error
	}
	if productResult.RowsAffected == 0 {
		return ErrStockNotEnough
	}
	return nil
}

func buildDeliveryContent(orderNo string, item model.OrderItem) string {
	codes := make([]string, 0, item.Quantity)
	for i := 0; i < item.Quantity; i++ {
		codes = append(codes, fmt.Sprintf("%s-%d-%02d", strings.ToUpper(strings.ReplaceAll(orderNo, "DS", "DV")), item.SKUID, i+1))
	}
	return fmt.Sprintf("商品：%s\n交付方式：自动发货\n交付内容：%s", item.ProductName, strings.Join(codes, ", "))
}

func buildCardSecretDeliveryContent(item model.OrderItem, count int) string {
	return fmt.Sprintf("商品：%s\n交付方式：安全卡密发放\n交付内容：已发放 %d 份卡密，请前往卡密中心查看完整兑换信息。", item.ProductName, count)
}
