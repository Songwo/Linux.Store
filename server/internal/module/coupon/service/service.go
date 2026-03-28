package service

import (
	"context"
	"strings"
	"time"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/model"
	coupondto "devstore/server/internal/module/coupon/dto"
	couponrepo "devstore/server/internal/module/coupon/repository"
)

type Service struct{ repo *couponrepo.Repository }

func New(repo *couponrepo.Repository) *Service { return &Service{repo: repo} }

func (s *Service) ListTemplates(ctx context.Context) (interface{}, *apperr.AppError) {
	items, err := s.repo.ListTemplates(ctx)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "加载优惠券模板失败", err)
	}
	return items, nil
}

func (s *Service) AdminListTemplates(ctx context.Context) (interface{}, *apperr.AppError) {
	items, err := s.repo.AdminListTemplates(ctx)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "加载管理端优惠券模板失败", err)
	}
	return items, nil
}

func (s *Service) CreateTemplate(ctx context.Context, req coupondto.CreateCouponTemplateRequest) (interface{}, *apperr.AppError) {
	startAt, err := time.ParseInLocation("2006-01-02 15:04:05", req.StartAt, time.Local)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeValidationError, "开始时间格式错误", err)
	}
	endAt, err := time.ParseInLocation("2006-01-02 15:04:05", req.EndAt, time.Local)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeValidationError, "结束时间格式错误", err)
	}
	tpl := &model.CouponTemplate{Name: req.Name, Type: req.Type, Total: req.Total, Issued: 0, Amount: req.Amount, ThresholdAmount: req.ThresholdAmount, PointsCost: req.PointsCost, Status: 1, StartAt: &startAt, EndAt: &endAt, Description: req.Description}
	if err := s.repo.CreateTemplate(ctx, tpl); err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "创建优惠券模板失败", err)
	}
	return tpl, nil
}

func (s *Service) ListUserCoupons(ctx context.Context, userID uint64) (interface{}, *apperr.AppError) {
	items, err := s.repo.ListUserCoupons(ctx, userID)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "加载用户优惠券失败", err)
	}
	return items, nil
}

func (s *Service) Claim(ctx context.Context, userID uint64, req coupondto.ClaimCouponRequest) *apperr.AppError {
	if err := s.repo.Claim(ctx, userID, req.TemplateID); err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "unavailable") {
			return apperr.New(apperr.CodeCouponUnavailable, "优惠券模板不可用")
		}
		if strings.Contains(strings.ToLower(err.Error()), "sold out") {
			return apperr.New(apperr.CodeCouponUnavailable, "优惠券已抢光")
		}
		if strings.Contains(strings.ToLower(err.Error()), "already claimed") {
			return apperr.New(apperr.CodeCouponAlreadyClaimed, "优惠券已领取过")
		}
		return apperr.Wrap(apperr.CodeInternalError, "领取优惠券失败", err)
	}
	return nil
}
