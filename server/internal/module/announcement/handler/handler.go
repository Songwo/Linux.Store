package handler

import (
	"net/http"
	"strconv"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/response"
	announcementdto "devstore/server/internal/module/announcement/dto"
	announcementsvc "devstore/server/internal/module/announcement/service"
	"github.com/gin-gonic/gin"
)

type Handler struct{ svc *announcementsvc.Service }

func New(svc *announcementsvc.Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) PublicList(c *gin.Context) {
	res, appErr := h.svc.PublicList(c.Request.Context())
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) AdminList(c *gin.Context) {
	var query announcementdto.ListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid query", err))
		return
	}
	res, appErr := h.svc.AdminList(c.Request.Context(), query)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) Create(c *gin.Context) {
	var req announcementdto.AdminUpsertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid announcement params", err))
		return
	}
	res, appErr := h.svc.Create(c.Request.Context(), req)
	if appErr != nil {
		response.Fail(c, http.StatusBadRequest, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid announcement id", err))
		return
	}
	var req announcementdto.AdminUpsertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid announcement params", err))
		return
	}
	res, appErr := h.svc.Update(c.Request.Context(), id, req)
	if appErr != nil {
		status := http.StatusBadRequest
		if appErr.Code == apperr.CodeNotFound {
			status = http.StatusNotFound
		}
		response.Fail(c, status, appErr)
		return
	}
	response.Success(c, res)
}
