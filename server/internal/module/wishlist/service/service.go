package service

import (
	"context"

	apperr "devstore/server/internal/common/errors"
	wishlistrepo "devstore/server/internal/module/wishlist/repository"
)

type Service struct{ repo *wishlistrepo.Repository }

func New(repo *wishlistrepo.Repository) *Service { return &Service{repo: repo} }

func (s *Service) List(ctx context.Context, userID uint64) (interface{}, *apperr.AppError) {
	rows, err := s.repo.List(ctx, userID)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load wishlist failed", err)
	}
	return rows, nil
}

func (s *Service) Add(ctx context.Context, userID, productID uint64) *apperr.AppError {
	if err := s.repo.Toggle(ctx, userID, productID, true); err != nil {
		return apperr.Wrap(apperr.CodeInternalError, "add wishlist failed", err)
	}
	return nil
}

func (s *Service) Remove(ctx context.Context, userID, productID uint64) *apperr.AppError {
	if err := s.repo.Toggle(ctx, userID, productID, false); err != nil {
		return apperr.Wrap(apperr.CodeInternalError, "remove wishlist failed", err)
	}
	return nil
}

func (s *Service) Exists(ctx context.Context, userID, productID uint64) (bool, *apperr.AppError) {
	ok, err := s.repo.Exists(ctx, userID, productID)
	if err != nil {
		return false, apperr.Wrap(apperr.CodeInternalError, "load wishlist status failed", err)
	}
	return ok, nil
}
