package handler

import (
	"net/http"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/response"
	"devstore/server/internal/module/auth/dto"
	authsvc "devstore/server/internal/module/auth/service"
	"github.com/gin-gonic/gin"
)

type Handler struct{ svc *authsvc.Service }

func New(svc *authsvc.Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid params", err))
		return
	}
	res, appError := h.svc.Register(c.Request.Context(), req)
	if appError != nil {
		response.Fail(c, http.StatusBadRequest, appError)
		return
	}
	response.Success(c, res)
}

func (h *Handler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid params", err))
		return
	}
	res, appError := h.svc.Login(c.Request.Context(), req)
	if appError != nil {
		status := http.StatusUnauthorized
		if appError.Code >= 50000 {
			status = http.StatusInternalServerError
		}
		response.Fail(c, status, appError)
		return
	}
	response.Success(c, res)
}
