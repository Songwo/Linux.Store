package service

import (
	"context"
	"strings"

	apperr "devstore/server/internal/common/errors"
	walletrepo "devstore/server/internal/module/wallet/repository"
)

type Service struct{ repo *walletrepo.Repository }

func New(repo *walletrepo.Repository) *Service { return &Service{repo: repo} }

func (s *Service) Summary(ctx context.Context, userID uint64) (interface{}, *apperr.AppError) {
	res, err := s.repo.Summary(ctx, userID)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load wallet summary failed", err)
	}
	return res, nil
}

func (s *Service) Flows(ctx context.Context, userID uint64, bizType, flowType, dateFrom, dateTo string, page, pageSize int) (interface{}, *apperr.AppError) {
	rows, total, err := s.repo.ListFlows(ctx, userID, strings.TrimSpace(bizType), strings.TrimSpace(flowType), strings.TrimSpace(dateFrom), strings.TrimSpace(dateTo), page, pageSize)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load wallet flows failed", err)
	}
	return map[string]interface{}{"list": rows, "total": total, "page": page, "page_size": pageSize}, nil
}
