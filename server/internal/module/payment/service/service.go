package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/model"
	paymentdto "devstore/server/internal/module/payment/dto"
	paymentrepo "devstore/server/internal/module/payment/repository"
	"devstore/server/internal/mq/message"
	mqproducer "devstore/server/internal/mq/producer"
)

type Service struct {
	repo     *paymentrepo.Repository
	producer *mqproducer.Producer
}

func New(repo *paymentrepo.Repository, producer *mqproducer.Producer) *Service {
	return &Service{repo: repo, producer: producer}
}

func (s *Service) BalancePay(ctx context.Context, userID uint64, req paymentdto.BalancePayRequest) (interface{}, *apperr.AppError) {
	order, err := s.repo.GetOrderByNo(ctx, req.OrderNo)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeNotFound, "订单不存在", err)
	}
	if order.UserID != userID {
		return nil, apperr.New(apperr.CodeForbidden, "无权支付此订单")
	}
	if order.Status != 10 {
		return nil, apperr.New(apperr.CodePaymentDuplicate, "订单已支付或已关闭")
	}
	payOrder := &model.PaymentOrder{PayNo: fmt.Sprintf("PAY%d", time.Now().UnixNano()), OrderNo: order.OrderNo, UserID: userID, PayType: "balance", Status: 10, Amount: order.PayAmount, IdempotentKey: strings.TrimSpace(req.IdempotentKey)}
	if err := s.repo.BalancePay(ctx, order, payOrder); err != nil {
		switch {
		case err == paymentrepo.ErrPaymentDuplicate:
			return nil, apperr.Wrap(apperr.CodePaymentDuplicate, "重复的支付请求", err)
		case err == paymentrepo.ErrInsufficientBalance:
			return nil, apperr.New(apperr.CodeBadRequest, "余额不足")
		case err == paymentrepo.ErrInsufficientPoints:
			return nil, apperr.New(apperr.CodeBadRequest, "积分不足")
		case err == paymentrepo.ErrStockNotEnough:
			return nil, apperr.New(apperr.CodeStockNotEnough, "库存不足")
		case err == paymentrepo.ErrCardSecretStockNotEnough:
			return nil, apperr.New(apperr.CodeStockNotEnough, "卡密库存不足")
		case strings.Contains(strings.ToLower(err.Error()), "duplicate"):
			return nil, apperr.Wrap(apperr.CodePaymentDuplicate, "重复的支付请求", err)
		default:
			return nil, apperr.Wrap(apperr.CodeInternalError, "余额支付失败", err)
		}
	}
	reward := int64(order.PayAmount)
	_ = s.producer.Publish(ctx, message.ExchangePayment, message.RoutingPaymentSuccess, message.NewEnvelope(payOrder.PayNo, "payment.success", order.OrderNo, req.IdempotentKey, map[string]interface{}{"order_no": order.OrderNo, "user_id": userID, "reward": reward}))
	return map[string]interface{}{"pay_no": payOrder.PayNo, "order_no": order.OrderNo, "status": "completed", "order_status": 50, "points_reward": reward}, nil
}
