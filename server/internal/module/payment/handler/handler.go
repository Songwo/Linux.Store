package handler

import (
	"net/http"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/response"
	paymentdto "devstore/server/internal/module/payment/dto"
	paymentsvc "devstore/server/internal/module/payment/service"
	"github.com/gin-gonic/gin"
)

type Handler struct{ svc *paymentsvc.Service }

func New(svc *paymentsvc.Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) BalancePay(c *gin.Context) {
	var req paymentdto.BalancePayRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid payment params", err))
		return
	}
	res, appErr := h.svc.BalancePay(c.Request.Context(), c.GetUint64("user_id"), req)
	if appErr != nil {
		response.Fail(c, http.StatusBadRequest, appErr)
		return
	}
	response.Success(c, res)
}
