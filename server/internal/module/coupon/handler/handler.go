package handler

import (
	"net/http"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/response"
	coupondto "devstore/server/internal/module/coupon/dto"
	couponsvc "devstore/server/internal/module/coupon/service"
	"github.com/gin-gonic/gin"
)

type Handler struct{ svc *couponsvc.Service }

func New(svc *couponsvc.Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) TemplateList(c *gin.Context) {
	res, appErr := h.svc.ListTemplates(c.Request.Context())
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) AdminTemplateList(c *gin.Context) {
	res, appErr := h.svc.AdminListTemplates(c.Request.Context())
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) AdminCreateTemplate(c *gin.Context) {
	var req coupondto.CreateCouponTemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid coupon template params", err))
		return
	}
	res, appErr := h.svc.CreateTemplate(c.Request.Context(), req)
	if appErr != nil {
		response.Fail(c, http.StatusBadRequest, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) UserList(c *gin.Context) {
	res, appErr := h.svc.ListUserCoupons(c.Request.Context(), c.GetUint64("user_id"))
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) Claim(c *gin.Context) {
	var req coupondto.ClaimCouponRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid coupon claim params", err))
		return
	}
	if appErr := h.svc.Claim(c.Request.Context(), c.GetUint64("user_id"), req); appErr != nil {
		response.Fail(c, http.StatusBadRequest, appErr)
		return
	}
	response.Success(c, gin.H{"ok": true})
}
