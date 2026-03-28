package handler

import (
	"net/http"
	"strconv"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/response"
	wishlistsvc "devstore/server/internal/module/wishlist/service"
	"github.com/gin-gonic/gin"
)

type Handler struct{ svc *wishlistsvc.Service }

func New(svc *wishlistsvc.Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) List(c *gin.Context) {
	res, appErr := h.svc.List(c.Request.Context(), c.GetUint64("user_id"))
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) Status(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("productId"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid product id", err))
		return
	}
	liked, appErr := h.svc.Exists(c.Request.Context(), c.GetUint64("user_id"), productID)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, gin.H{"liked": liked})
}

func (h *Handler) Add(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("productId"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid product id", err))
		return
	}
	if appErr := h.svc.Add(c.Request.Context(), c.GetUint64("user_id"), productID); appErr != nil {
		response.Fail(c, http.StatusBadRequest, appErr)
		return
	}
	response.Success(c, gin.H{"liked": true})
}

func (h *Handler) Remove(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("productId"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid product id", err))
		return
	}
	if appErr := h.svc.Remove(c.Request.Context(), c.GetUint64("user_id"), productID); appErr != nil {
		response.Fail(c, http.StatusBadRequest, appErr)
		return
	}
	response.Success(c, gin.H{"liked": false})
}
