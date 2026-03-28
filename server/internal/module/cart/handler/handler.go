package handler

import (
	"net/http"
	"strconv"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/response"
	cartdto "devstore/server/internal/module/cart/dto"
	cartsvc "devstore/server/internal/module/cart/service"
	"github.com/gin-gonic/gin"
)

type Handler struct{ svc *cartsvc.Service }

func New(svc *cartsvc.Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) AddItem(c *gin.Context) {
	var req cartdto.AddCartItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid cart params", err))
		return
	}
	if appErr := h.svc.AddItem(c.Request.Context(), c.GetUint64("user_id"), req); appErr != nil {
		response.Fail(c, http.StatusBadRequest, appErr)
		return
	}
	response.Success(c, gin.H{"ok": true})
}

func (h *Handler) List(c *gin.Context) {
	res, appErr := h.svc.List(c.Request.Context(), c.GetUint64("user_id"))
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) Remove(c *gin.Context) {
	skuID, err := strconv.ParseUint(c.Param("skuId"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid sku id", err))
		return
	}
	if appErr := h.svc.Remove(c.Request.Context(), c.GetUint64("user_id"), skuID); appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, gin.H{"ok": true})
}
func (h *Handler) UpdateChecked(c *gin.Context) {
	skuID, err := strconv.ParseUint(c.Param("skuId"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid sku id", err))
		return
	}
	var req cartdto.UpdateCartItemCheckedRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid params", err))
		return
	}
	if appErr := h.svc.UpdateChecked(c.Request.Context(), c.GetUint64("user_id"), skuID, req.Checked); appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, gin.H{"ok": true})
}

func (h *Handler) UpdateQuantity(c *gin.Context) {
	skuID, err := strconv.ParseUint(c.Param("skuId"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid sku id", err))
		return
	}
	var req cartdto.UpdateCartItemQuantityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid params", err))
		return
	}
	if appErr := h.svc.UpdateQuantity(c.Request.Context(), c.GetUint64("user_id"), skuID, req.Quantity); appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, gin.H{"ok": true})
}
