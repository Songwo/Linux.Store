package service

import (
	"context"
	"fmt"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/types"
	"devstore/server/internal/model"
	oauthdto "devstore/server/internal/module/oauth/dto"
	oauthprovider "devstore/server/internal/module/oauth/provider"
	oauthrepo "devstore/server/internal/module/oauth/repository"
	jwtpkg "devstore/server/internal/pkg/jwt"
	"gorm.io/gorm"
)

type Service struct {
	provider *oauthprovider.LinuxDOProvider
	repo     *oauthrepo.Repository
	jwt      *jwtpkg.Manager
}

func New(provider *oauthprovider.LinuxDOProvider, repo *oauthrepo.Repository, jwt *jwtpkg.Manager) *Service {
	return &Service{provider: provider, repo: repo, jwt: jwt}
}

func (s *Service) AuthorizeURL(state string) string {
	return s.provider.AuthorizeURL(state)
}

func (s *Service) HandleCallback(ctx context.Context, code string) (map[string]interface{}, error) {
	token, err := s.provider.ExchangeToken(ctx, code)
	if err != nil {
		return nil, err
	}
	oauthUser, err := s.provider.FetchUser(ctx, token)
	if err != nil {
		return nil, err
	}
	user, isNew, err := s.resolveOrCreateUser(ctx, oauthUser, token)
	if err != nil {
		return nil, err
	}
	localToken, err := s.jwt.Generate(types.UserClaims{UserID: user.ID, Email: derefString(user.Email), Nickname: user.Nickname, Role: "user"})
	if err != nil {
		return nil, fmt.Errorf("generate jwt failed: %w", err)
	}
	return map[string]interface{}{"provider": "linux_do", "oauth_user": oauthUser, "token": localToken, "binding_required": false, "is_new_user": isNew}, nil
}

func (s *Service) BindCurrentUser(ctx context.Context, userID uint64, code string) (map[string]interface{}, *apperr.AppError) {
	token, err := s.provider.ExchangeToken(ctx, code)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "exchange linux.do token failed", err)
	}
	oauthUser, err := s.provider.FetchUser(ctx, token)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "fetch linux.do profile failed", err)
	}
	if err := s.repo.BindOAuthToUser(ctx, userID, "linux_do", oauthUser, token); err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "bind linux.do account failed", err)
	}
	return map[string]interface{}{"bound": true, "provider_user_id": oauthUser.ID, "provider_username": oauthUser.Username}, nil
}

func (s *Service) resolveOrCreateUser(ctx context.Context, oauthUser *oauthdto.LinuxDOUser, accessToken string) (*model.User, bool, error) {
	binding, err := s.repo.GetBindingByProviderUID(ctx, "linux_do", oauthUser.ID)
	if err == nil {
		user, userErr := s.repo.GetUserByID(ctx, binding.UserID)
		return user, false, userErr
	}
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, false, err
	}
	if oauthUser.Email != "" {
		user, userErr := s.repo.GetUserByEmail(ctx, oauthUser.Email)
		if userErr == nil {
			if bindErr := s.repo.BindOAuthToUser(ctx, user.ID, "linux_do", oauthUser, accessToken); bindErr != nil {
				return nil, false, bindErr
			}
			return user, false, nil
		}
		if userErr != nil && userErr != gorm.ErrRecordNotFound {
			return nil, false, userErr
		}
	}
	user, createErr := s.repo.CreateOAuthUser(ctx, "linux_do", oauthUser, accessToken, 100)
	if createErr != nil {
		return nil, false, createErr
	}
	return user, true, nil
}

func derefString(v *string) string {
	if v == nil {
		return ""
	}
	return *v
}
