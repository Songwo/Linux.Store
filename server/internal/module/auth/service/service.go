package service

import (
	"context"
	"strings"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/types"
	"devstore/server/internal/model"
	"devstore/server/internal/module/auth/dto"
	authrepo "devstore/server/internal/module/auth/repository"
	jwtpkg "devstore/server/internal/pkg/jwt"
	"devstore/server/internal/pkg/password"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service struct {
	repo *authrepo.Repository
	jwt  *jwtpkg.Manager
}

func New(repo *authrepo.Repository, jwt *jwtpkg.Manager) *Service {
	return &Service{repo: repo, jwt: jwt}
}

func (s *Service) Register(ctx context.Context, req dto.RegisterRequest) (*dto.TokenResponse, *apperr.AppError) {
	hashed, err := password.Hash(req.Password)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "hash password failed", err)
	}
	email := strings.ToLower(strings.TrimSpace(req.Email))
	user := &model.User{UUID: uuid.NewString(), Email: &email, Nickname: req.Nickname, Status: 1, Source: "local"}
	auth := &model.UserAuth{AuthType: "password", Identifier: email, Credential: hashed, Verified: 1}
	if err := s.repo.CreateUser(ctx, user, auth); err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate") {
			return nil, apperr.Wrap(apperr.CodeValidationError, "email already exists", err)
		}
		return nil, apperr.Wrap(apperr.CodeInternalError, "register failed", err)
	}
	return s.issueToken(user)
}

func (s *Service) Login(ctx context.Context, req dto.LoginRequest) (*dto.TokenResponse, *apperr.AppError) {
	auth, err := s.repo.GetUserAuthByIdentifier(ctx, strings.ToLower(strings.TrimSpace(req.Identifier)))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, apperr.New(apperr.CodeAuthFailed, "invalid credentials")
		}
		return nil, apperr.Wrap(apperr.CodeInternalError, "load auth failed", err)
	}
	if !password.Verify(auth.Credential, req.Password) {
		return nil, apperr.New(apperr.CodeAuthFailed, "invalid credentials")
	}
	user, err := s.repo.GetUserByID(ctx, auth.UserID)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load user failed", err)
	}
	if user.Status != 1 {
		return nil, apperr.New(apperr.CodeUserDisabled, "user disabled")
	}
	return s.issueToken(user)
}

func (s *Service) issueToken(user *model.User) (*dto.TokenResponse, *apperr.AppError) {
	email := ""
	if user.Email != nil {
		email = *user.Email
	}
	token, err := s.jwt.Generate(types.UserClaims{UserID: user.ID, Email: email, Nickname: user.Nickname, Role: "user"})
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "generate token failed", err)
	}
	return &dto.TokenResponse{Token: token, User: map[string]interface{}{"id": user.ID, "email": email, "nickname": user.Nickname, "avatar": user.Avatar}}, nil
}
