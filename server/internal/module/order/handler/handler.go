package handler

import (
	"net/http"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/response"
	orderdto "devstore/server/internal/module/order/dto"
	ordersvc "devstore/server/internal/module/order/service"
	"github.com/gin-gonic/gin"
)

type Handler struct{ svc *ordersvc.Service }

func New(svc *ordersvc.Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) Create(c *gin.Context) {
	var req orderdto.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid create order params", err))
		return
	}
	res, appErr := h.svc.Create(c.Request.Context(), c.GetUint64("user_id"), req)
	if appErr != nil {
		response.Fail(c, http.StatusBadRequest, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) List(c *gin.Context) {
	res, appErr := h.svc.List(c.Request.Context(), c.GetUint64("user_id"), c.Query("status"))
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) Detail(c *gin.Context) {
	res, appErr := h.svc.Detail(c.Request.Context(), c.GetUint64("user_id"), c.Param("orderNo"))
	if appErr != nil {
		status := http.StatusBadRequest
		if appErr.Code == apperr.CodeNotFound {
			status = http.StatusNotFound
		}
		if appErr.Code == apperr.CodeForbidden {
			status = http.StatusForbidden
		}
		response.Fail(c, status, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) Cancel(c *gin.Context) {
	if appErr := h.svc.Cancel(c.Request.Context(), c.GetUint64("user_id"), c.Param("orderNo")); appErr != nil {
		response.Fail(c, http.StatusBadRequest, appErr)
		return
	}
	response.Success(c, gin.H{"ok": true})
}
