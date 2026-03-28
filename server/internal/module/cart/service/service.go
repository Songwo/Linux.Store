package service

import (
	"context"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/model"
	cartdto "devstore/server/internal/module/cart/dto"
	cartrepo "devstore/server/internal/module/cart/repository"
)

type Service struct{ repo *cartrepo.Repository }

func New(repo *cartrepo.Repository) *Service { return &Service{repo: repo} }

func (s *Service) AddItem(ctx context.Context, userID uint64, req cartdto.AddCartItemRequest) *apperr.AppError {
	cart, err := s.repo.EnsureCart(ctx, userID)
	if err != nil {
		return apperr.Wrap(apperr.CodeInternalError, "ensure cart failed", err)
	}
	sku, err := s.repo.GetSKU(ctx, req.SKUID)
	if err != nil {
		return apperr.Wrap(apperr.CodeNotFound, "sku not found", err)
	}
	item := &model.CartItem{CartID: cart.ID, UserID: userID, ProductID: sku.ProductID, SKUID: req.SKUID, Quantity: req.Quantity, Checked: 1}
	if req.Checked == 0 || req.Checked == 1 {
		item.Checked = req.Checked
	}
	if err := s.repo.UpsertCartItem(ctx, item); err != nil {
		return apperr.Wrap(apperr.CodeInternalError, "save cart item failed", err)
	}
	return nil
}

func (s *Service) List(ctx context.Context, userID uint64) (interface{}, *apperr.AppError) {
	items, err := s.repo.ListCartItems(ctx, userID)
	if err != nil {
		return nil, apperr.Wrap(apperr.CodeInternalError, "load cart items failed", err)
	}
	resp := make([]cartdto.CartItemResponse, len(items))
	for i, item := range items {
		resp[i] = cartdto.CartItemResponse{
			ID:          item.ID,
			SKUID:       item.SKUID,
			Quantity:    item.Quantity,
			Checked:     item.Checked,
			ProductName: item.ProductName,
			Cover:       item.Cover,
			Price:       item.Price,
			PointsPrice: item.PointsPrice,
			SKUTitle:    item.SKUTitle,
			CreatedAt:   item.CreatedAt,
			UpdatedAt:   item.UpdatedAt,
		}
	}
	return resp, nil
}

func (s *Service) Remove(ctx context.Context, userID, skuID uint64) *apperr.AppError {
	if err := s.repo.DeleteCartItem(ctx, userID, skuID); err != nil {
		return apperr.Wrap(apperr.CodeInternalError, "delete cart item failed", err)
	}
	return nil
}
func (s *Service) UpdateChecked(ctx context.Context, userID, skuID uint64, checked int8) *apperr.AppError {
	if err := s.repo.UpdateChecked(ctx, userID, skuID, checked); err != nil {
		return apperr.Wrap(apperr.CodeInternalError, "update checked status failed", err)
	}
	return nil
}

func (s *Service) UpdateQuantity(ctx context.Context, userID, skuID uint64, quantity int) *apperr.AppError {
	if err := s.repo.UpdateQuantity(ctx, userID, skuID, quantity); err != nil {
		return apperr.Wrap(apperr.CodeInternalError, "update quantity failed", err)
	}
	return nil
}
