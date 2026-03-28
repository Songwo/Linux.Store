package handler

import (
	"net/http"
	"strconv"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/response"
	"devstore/server/internal/model"
	campaignsvc "devstore/server/internal/module/campaign/service"
	"github.com/gin-gonic/gin"
)

type Handler struct{ svc *campaignsvc.Service }

func New(svc *campaignsvc.Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) List(c *gin.Context) {
	res, appErr := h.svc.List(c.Request.Context())
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) AdminList(c *gin.Context) {
	res, appErr := h.svc.AdminList(c.Request.Context())
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) Create(c *gin.Context) {
	var req model.Campaign
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid params", err))
		return
	}
	appErr := h.svc.Create(c.Request.Context(), &req)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, nil)
}

func (h *Handler) Update(c *gin.Context) {
	var req model.Campaign
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid params", err))
		return
	}
	appErr := h.svc.Update(c.Request.Context(), &req)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, nil)
}

func (h *Handler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid id", err))
		return
	}
	appErr := h.svc.Delete(c.Request.Context(), id)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, nil)
}
