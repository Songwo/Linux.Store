package service

import (
	"context"
	"errors"
	"strings"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/model"
	categoryrepo "devstore/server/internal/module/category/repository"
	"gorm.io/gorm"
)

type Service struct{ repo *categoryrepo.Repository }

func New(repo *categoryrepo.Repository) *Service { return &Service{repo: repo} }

func (s *Service) List(ctx context.Context) ([]model.Category, *apperr.AppError) {
	items, err := s.repo.List(ctx)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load category list failed", err)
	}
	return items, nil
}

func (s *Service) AdminList(ctx context.Context) ([]model.Category, *apperr.AppError) {
	items, err := s.repo.AdminList(ctx)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load admin category list failed", err)
	}
	return items, nil
}

func (s *Service) Create(ctx context.Context, category model.Category) (*model.Category, *apperr.AppError) {
	normalized, appErr := s.normalizeAndValidate(ctx, 0, category)
	if appErr != nil {
		return nil, appErr
	}
	if err := s.repo.Create(ctx, normalized); err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "create category failed", err)
	}
	return normalized, nil
}

func (s *Service) Update(ctx context.Context, id uint64, category model.Category) (*model.Category, *apperr.AppError) {
	if _, err := s.repo.GetByID(ctx, id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperr.Wrap(apperr.CodeNotFound, "category not found", err)
		}
		return nil, apperr.Wrap(apperr.CodeInternalError, "load category failed", err)
	}

	normalized, appErr := s.normalizeAndValidate(ctx, id, category)
	if appErr != nil {
		return nil, appErr
	}
	normalized.ID = id
	if err := s.repo.Update(ctx, normalized); err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "update category failed", err)
	}
	return normalized, nil
}

func (s *Service) normalizeAndValidate(ctx context.Context, id uint64, category model.Category) (*model.Category, *apperr.AppError) {
	category.Name = strings.TrimSpace(category.Name)
	category.Icon = strings.TrimSpace(category.Icon)
	if category.Name == "" {
		return nil, apperr.New(apperr.CodeValidationError, "分类名称不能为空")
	}
	if category.Status != 0 {
		category.Status = 1
	}
	if category.ParentID == id && id > 0 {
		return nil, apperr.New(apperr.CodeValidationError, "父级分类不能是自己")
	}
	if category.ParentID > 0 {
		if _, err := s.repo.GetByID(ctx, category.ParentID); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, apperr.Wrap(apperr.CodeValidationError, "父级分类不存在", err)
			}
			return nil, apperr.Wrap(apperr.CodeInternalError, "load parent category failed", err)
		}
	}
	return &category, nil
}
