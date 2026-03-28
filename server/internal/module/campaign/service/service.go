package service

import (
	"context"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/model"
	campaignrepo "devstore/server/internal/module/campaign/repository"
)

type Service struct{ repo *campaignrepo.Repository }

func New(repo *campaignrepo.Repository) *Service { return &Service{repo: repo} }

func (s *Service) List(ctx context.Context) (interface{}, *apperr.AppError) {
	items, err := s.repo.ListActive(ctx)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load campaign list failed", err)
	}
	return items, nil
}

func (s *Service) AdminList(ctx context.Context) (interface{}, *apperr.AppError) {
	items, err := s.repo.ListAll(ctx)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load admin campaign list failed", err)
	}
	return items, nil
}

func (s *Service) Create(ctx context.Context, campaign *model.Campaign) *apperr.AppError {
	if campaign.Rules == "" {
		campaign.Rules = "{}"
	}
	if err := s.repo.Create(ctx, campaign); err != nil {
		return apperr.Wrap(apperr.CodeInternalError, "create campaign failed", err)
	}
	return nil
}

func (s *Service) Update(ctx context.Context, campaign *model.Campaign) *apperr.AppError {
	if campaign.Rules == "" {
		campaign.Rules = "{}"
	}
	if err := s.repo.Update(ctx, campaign); err != nil {
		return apperr.Wrap(apperr.CodeInternalError, "update campaign failed", err)
	}
	return nil
}

func (s *Service) Delete(ctx context.Context, id uint64) *apperr.AppError {
	if err := s.repo.Delete(ctx, id); err != nil {
		return apperr.Wrap(apperr.CodeInternalError, "delete campaign failed", err)
	}
	return nil
}
