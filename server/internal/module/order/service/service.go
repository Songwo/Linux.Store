package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/model"
	cardsecretrepo "devstore/server/internal/module/cardsecret/repository"
	orderdto "devstore/server/internal/module/order/dto"
	orderrepo "devstore/server/internal/module/order/repository"
	"devstore/server/internal/mq/message"
	mqproducer "devstore/server/internal/mq/producer"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type Service struct {
	repo        *orderrepo.Repository
	producer    *mqproducer.Producer
	redis       *redis.Client
	cardSecrets *cardsecretrepo.Repository
}

func New(repo *orderrepo.Repository, producer *mqproducer.Producer, redisClient *redis.Client, cardSecretRepo *cardsecretrepo.Repository) *Service {
	return &Service{repo: repo, producer: producer, redis: redisClient, cardSecrets: cardSecretRepo}
}

func (s *Service) Create(ctx context.Context, userID uint64, req orderdto.CreateOrderRequest) (interface{}, *apperr.AppError) {
	if strings.TrimSpace(req.SubmitToken) == "" {
		return nil, apperr.New(apperr.CodeValidationError, "表单令牌缺失")
	}
	orderNo := fmt.Sprintf("DS%d", time.Now().UnixNano())
	var total float64
	var totalPoints int64
	items := make([]model.OrderItem, 0, len(req.Items))
	for _, item := range req.Items {
		sku, err := s.repo.GetSKUForOrder(ctx, item.SKUID)
		if err != nil {
			return nil, apperr.Wrap(apperr.CodeNotFound, "sku not found", err)
		}
		if sku.Stock < int64(item.Quantity) {
			return nil, apperr.New(apperr.CodeStockNotEnough, "库存不足")
		}
		lineAmount := sku.Price * float64(item.Quantity)
		var linePoints int64
		if req.UsePoints {
			linePoints = sku.PointsPrice * int64(item.Quantity)
		}
		total += lineAmount
		totalPoints += linePoints
		items = append(items, model.OrderItem{UserID: userID, ProductID: sku.ProductID, SKUID: sku.ID, ProductName: sku.ProductName, SKUTitle: sku.Title, Cover: sku.Cover, Price: sku.Price, PointsPrice: sku.PointsPrice, Quantity: item.Quantity, TotalAmount: lineAmount})
	}
	payDeadline := time.Now().Add(15 * time.Minute)
	order := &model.Order{OrderNo: orderNo, UserID: userID, OrderType: "normal", Status: 10, TotalAmount: total, DiscountAmount: 0, PayAmount: total, PointsAmount: totalPoints, Remark: req.Remark, SubmitToken: req.SubmitToken, PayDeadlineAt: &payDeadline}
	if err := s.repo.CreateOrder(ctx, order, items, req.CouponID); err != nil {
		if errors.Is(err, orderrepo.ErrCouponUnavailable) {
			return nil, apperr.New(apperr.CodeCouponUnavailable, "优惠券不可用")
		}
		if errors.Is(err, orderrepo.ErrInsufficientBalance) {
			return nil, apperr.New(apperr.CodeBadRequest, "余额不足")
		}
		if errors.Is(err, orderrepo.ErrInsufficientPoints) {
			return nil, apperr.New(apperr.CodeBadRequest, "积分不足")
		}
		if err == gorm.ErrDuplicatedKey || strings.Contains(strings.ToLower(err.Error()), "duplicate") {
			return nil, apperr.Wrap(apperr.CodeOrderDuplicate, "订单重复提交", err)
		}
		return nil, apperr.Wrap(apperr.CodeInternalError, "创建订单失败", err)
	}
	payload := map[string]interface{}{"order_no": orderNo, "user_id": userID, "order_type": order.OrderType}
	_ = s.producer.Publish(ctx, message.ExchangeDelay, message.RoutingOrderCloseDelay, message.NewEnvelope(orderNo, "order.close.delay", orderNo, req.SubmitToken, payload), mqproducer.WithExpiration(15*time.Minute))
	return map[string]interface{}{"order_no": orderNo, "status": order.Status, "pay_amount": order.PayAmount, "points_amount": order.PointsAmount, "pay_deadline_at": payDeadline}, nil
}

func (s *Service) List(ctx context.Context, userID uint64, status string) (interface{}, *apperr.AppError) {
	rows, err := s.repo.ListOrders(ctx, userID, strings.TrimSpace(status))
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "加载订单详情失败", err)
	}
	return rows, nil
}

func (s *Service) Detail(ctx context.Context, userID uint64, orderNo string) (interface{}, *apperr.AppError) {
	order, err := s.repo.GetOrderByNo(ctx, orderNo)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeNotFound, "订单不存在", err)
	}
	if order.UserID != userID {
		return nil, apperr.New(apperr.CodeForbidden, "无权访问此订单")
	}
	items, err := s.repo.GetOrderItems(ctx, orderNo)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "加载订单详情失败", err)
	}
	deliveries, err := s.repo.GetDeliveryRecords(ctx, orderNo)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load delivery records failed", err)
	}
	cards, err := s.cardSecrets.ListOrderCards(ctx, orderNo)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load card secrets failed", err)
	}
	return map[string]interface{}{"order": order, "items": items, "deliveries": deliveries, "cards": cards}, nil
}

func (s *Service) Cancel(ctx context.Context, userID uint64, orderNo string) *apperr.AppError {
	order, err := s.repo.GetOrderByNo(ctx, orderNo)
	if err != nil {
		return apperr.Wrap(apperr.CodeNotFound, "order not found", err)
	}
	if order.UserID != userID {
		return apperr.New(apperr.CodeForbidden, "order forbidden")
	}
	if order.Status != 10 {
		return apperr.New(apperr.CodeBadRequest, "仅待支付订单可取消")
	}
	items, err := s.repo.GetOrderItems(ctx, orderNo)
	if err != nil {
		return apperr.Wrap(apperr.CodeInternalError, "加载订单项失败", err)
	}
	if err := s.repo.CancelOrder(ctx, order); err != nil {
		return apperr.Wrap(apperr.CodeInternalError, "取消订单失败", err)
	}
	if order.OrderType == "seckill" && order.CampaignID != nil {
		s.releaseSeckillCache(ctx, *order.CampaignID, order.UserID, items, "cancelled")
	}
	return nil
}

func (s *Service) releaseSeckillCache(ctx context.Context, campaignID, userID uint64, items []model.OrderItem, result string) {
	for _, item := range items {
		stockKey := fmt.Sprintf("devstore:prod:seckill:stock:%d:%d", campaignID, item.SKUID)
		buyersKey := fmt.Sprintf("devstore:prod:seckill:buyers:%d:%d", campaignID, item.SKUID)
		_ = s.redis.IncrBy(ctx, stockKey, int64(item.Quantity)).Err()
		_ = s.redis.SRem(ctx, buyersKey, userID).Err()
	}
	resultKey := fmt.Sprintf("devstore:prod:seckill:result:%d:%d", campaignID, userID)
	_ = s.redis.Set(ctx, resultKey, result, 30*time.Minute).Err()
}
