package service

import (
	"context"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/model"
	reviewdto "devstore/server/internal/module/review/dto"
	reviewrepo "devstore/server/internal/module/review/repository"
)

type Service struct {
	repo *reviewrepo.Repository
}

func New(repo *reviewrepo.Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateReview(ctx context.Context, userID, productID uint64, req reviewdto.CreateReviewRequest) *apperr.AppError {
	review := &model.ProductReview{
		ProductID: productID,
		UserID:    userID,
		Rating:    req.Rating,
		Content:   req.Content,
	}

	if err := s.repo.CreateReview(ctx, review); err != nil {
		return apperr.Wrap(apperr.CodeInternalError, "create review failed", err)
	}
	return nil
}

func (s *Service) ListReviews(ctx context.Context, productID uint64, query reviewdto.ReviewListQuery) (*reviewdto.ReviewListResponse, *apperr.AppError) {
	list, total, err := s.repo.ListReviews(ctx, productID, query)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "list reviews failed", err)
	}

	page := query.Page
	if page <= 0 {
		page = 1
	}
	pageSize := query.PageSize
	if pageSize <= 0 {
		pageSize = 10
	}

	return &reviewdto.ReviewListResponse{
		List:     list,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}
