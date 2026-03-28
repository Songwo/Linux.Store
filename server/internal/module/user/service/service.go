package service

import (
	"context"

	apperr "devstore/server/internal/common/errors"
	userrepo "devstore/server/internal/module/user/repository"
)

type Service struct{ repo *userrepo.Repository }

func New(repo *userrepo.Repository) *Service { return &Service{repo: repo} }

func (s *Service) Profile(ctx context.Context, userID uint64) (interface{}, *apperr.AppError) {
	profile, err := s.repo.GetProfile(ctx, userID)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load profile failed", err)
	}
	signedToday, err := s.repo.HasSignedToday(ctx, userID)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load sign status failed", err)
	}
	email := ""
	if profile.Email != nil {
		email = *profile.Email
	}
	return map[string]interface{}{"user_id": profile.ID, "email": email, "nickname": profile.Nickname, "avatar": profile.Avatar, "balance": profile.Balance, "points": profile.Points, "sign_today": signedToday, "created_at": profile.CreatedAt, "source": profile.Source}, nil
}

func (s *Service) Center(ctx context.Context, userID uint64) (interface{}, *apperr.AppError) {
	res, err := s.repo.GetCenterStats(ctx, userID)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load user center failed", err)
	}
	return res, nil
}
