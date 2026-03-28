package handler

import (
	"net/http"
	"strconv"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/response"
	"devstore/server/internal/model"
	categorysvc "devstore/server/internal/module/category/service"
	"github.com/gin-gonic/gin"
)

type Handler struct{ svc *categorysvc.Service }

func New(svc *categorysvc.Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) List(c *gin.Context) {
	items, err := h.svc.List(c.Request.Context())
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err)
		return
	}
	response.Success(c, items)
}

func (h *Handler) AdminList(c *gin.Context) {
	items, err := h.svc.AdminList(c.Request.Context())
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err)
		return
	}
	response.Success(c, items)
}

func (h *Handler) AdminCreate(c *gin.Context) {
	var req model.Category
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid category params", err))
		return
	}
	item, appErr := h.svc.Create(c.Request.Context(), req)
	if appErr != nil {
		status := http.StatusInternalServerError
		if appErr.Code == apperr.CodeValidationError {
			status = http.StatusBadRequest
		}
		response.Fail(c, status, appErr)
		return
	}
	response.Success(c, item)
}

func (h *Handler) AdminUpdate(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid category id", err))
		return
	}
	var req model.Category
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid category params", err))
		return
	}
	item, appErr := h.svc.Update(c.Request.Context(), id, req)
	if appErr != nil {
		status := http.StatusInternalServerError
		if appErr.Code == apperr.CodeValidationError || appErr.Code == apperr.CodeNotFound {
			status = http.StatusBadRequest
		}
		response.Fail(c, status, appErr)
		return
	}
	response.Success(c, item)
}
