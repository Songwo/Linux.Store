package service

import (
	"context"
	"strings"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/types"
	adminrepo "devstore/server/internal/module/admin/repository"
	cardsecretrepo "devstore/server/internal/module/cardsecret/repository"
	jwtpkg "devstore/server/internal/pkg/jwt"
	"devstore/server/internal/pkg/password"
	"gorm.io/gorm"
)

type Service struct {
	repo        *adminrepo.Repository
	jwt         *jwtpkg.Manager
	cardSecrets *cardsecretrepo.Repository
}

func New(repo *adminrepo.Repository, jwt *jwtpkg.Manager, cardSecretRepo *cardsecretrepo.Repository) *Service {
	return &Service{repo: repo, jwt: jwt, cardSecrets: cardSecretRepo}
}

func (s *Service) Login(ctx context.Context, username, rawPassword string) (map[string]interface{}, *apperr.AppError) {
	admin, err := s.repo.GetByUsername(ctx, username)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, apperr.New(apperr.CodeAuthFailed, "invalid admin credentials")
		}
		return nil, apperr.Wrap(apperr.CodeInternalError, "load admin failed", err)
	}
	if admin.Status != 1 {
		return nil, apperr.New(apperr.CodeForbidden, "admin disabled")
	}
	if !password.Verify(admin.Password, rawPassword) {
		return nil, apperr.New(apperr.CodeAuthFailed, "invalid admin credentials")
	}
	token, err := s.jwt.Generate(types.UserClaims{UserID: admin.ID, Nickname: admin.Nickname, Role: "admin"})
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "generate token failed", err)
	}
	return map[string]interface{}{"token": token, "user": map[string]interface{}{"id": admin.ID, "username": admin.Username, "nickname": admin.Nickname, "role": "super_admin"}}, nil
}

func (s *Service) Dashboard(ctx context.Context) (map[string]interface{}, *apperr.AppError) {
	stats, err := s.repo.GetDashboardStats(ctx)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load dashboard stats failed", err)
	}
	return map[string]interface{}{
		"user_count":          stats.UserCount,
		"order_count":         stats.OrderCount,
		"gmv":                 stats.GMV,
		"campaign_count":      stats.CampaignCount,
		"today_paid_count":    stats.TodayPaidCount,
		"pending_pay_count":   stats.PendingPayCount,
		"seckill_order_count": stats.SeckillOrderCount,
	}, nil
}

func (s *Service) ListUsers(ctx context.Context, keyword string, page, pageSize int) (map[string]interface{}, *apperr.AppError) {
	rows, total, err := s.repo.ListUsers(ctx, keyword, page, pageSize)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load admin users failed", err)
	}
	return map[string]interface{}{"list": rows, "total": total, "page": page, "page_size": pageSize}, nil
}

func (s *Service) ListOrders(ctx context.Context, status, keyword string, page, pageSize int) (map[string]interface{}, *apperr.AppError) {
	rows, total, err := s.repo.ListOrders(ctx, status, keyword, page, pageSize)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load admin orders failed", err)
	}
	return map[string]interface{}{"list": rows, "total": total, "page": page, "page_size": pageSize}, nil
}

func (s *Service) AdjustInventory(ctx context.Context, skuID uint64, delta int64) (map[string]interface{}, *apperr.AppError) {
	if delta == 0 {
		return nil, apperr.New(apperr.CodeValidationError, "delta cannot be zero")
	}
	result, err := s.repo.AdjustInventory(ctx, skuID, delta)
	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "negative") {
			return nil, apperr.New(apperr.CodeBadRequest, "available stock would be negative")
		}
		if strings.Contains(strings.ToLower(err.Error()), "not found") {
			return nil, apperr.New(apperr.CodeNotFound, "inventory not found")
		}
		return nil, apperr.Wrap(apperr.CodeInternalError, "adjust inventory failed", err)
	}
	return map[string]interface{}{"sku_id": result.SkuID, "available_stock": result.AvailableStock, "delta": delta}, nil
}

func (s *Service) OrderDetail(ctx context.Context, orderNo string) (map[string]interface{}, *apperr.AppError) {
	order, user, items, deliveries, err := s.repo.GetOrderDetail(ctx, strings.TrimSpace(orderNo))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, apperr.New(apperr.CodeNotFound, "order not found")
		}
		return nil, apperr.Wrap(apperr.CodeInternalError, "load admin order detail failed", err)
	}
	cards, err := s.cardSecrets.ListOrderCards(ctx, strings.TrimSpace(orderNo))
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load card secret details failed", err)
	}
	return map[string]interface{}{"order": order, "user": user, "items": items, "deliveries": deliveries, "cards": cards}, nil
}

func (s *Service) AdjustUserWallet(ctx context.Context, userID uint64, amount float64, remark string, operatorID uint64) (map[string]interface{}, *apperr.AppError) {
	if amount == 0 {
		return nil, apperr.New(apperr.CodeValidationError, "amount cannot be zero")
	}
	account, err := s.repo.AdjustUserWallet(ctx, userID, amount, remark, operatorID)
	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "insufficient balance") {
			return nil, apperr.New(apperr.CodeBadRequest, "insufficient balance")
		}
		return nil, apperr.Wrap(apperr.CodeInternalError, "adjust wallet failed", err)
	}
	return map[string]interface{}{"user_id": userID, "balance": account.Balance, "amount": amount, "remark": strings.TrimSpace(remark)}, nil
}

func (s *Service) ListInventory(ctx context.Context, keyword string, page, pageSize int) (map[string]interface{}, *apperr.AppError) {
	rows, total, err := s.repo.ListInventory(ctx, keyword, page, pageSize)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load admin inventory failed", err)
	}
	return map[string]interface{}{"list": rows, "total": total, "page": page, "page_size": pageSize}, nil
}

func (s *Service) ListBalanceFlows(ctx context.Context, userID uint64, page, pageSize int) (map[string]interface{}, *apperr.AppError) {
	rows, total, err := s.repo.ListBalanceFlows(ctx, userID, page, pageSize)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load balance flows failed", err)
	}
	return map[string]interface{}{"list": rows, "total": total, "page": page, "page_size": pageSize}, nil
}

func (s *Service) ListPointsFlows(ctx context.Context, userID uint64, page, pageSize int) (map[string]interface{}, *apperr.AppError) {
	rows, total, err := s.repo.ListPointsFlows(ctx, userID, page, pageSize)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load points flows failed", err)
	}
	return map[string]interface{}{"list": rows, "total": total, "page": page, "page_size": pageSize}, nil
}

func (s *Service) ListOperationLogs(ctx context.Context, module string, page, pageSize int) (map[string]interface{}, *apperr.AppError) {
	rows, total, err := s.repo.ListOperationLogs(ctx, module, page, pageSize)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load operation logs failed", err)
	}
	return map[string]interface{}{"list": rows, "total": total, "page": page, "page_size": pageSize}, nil
}
