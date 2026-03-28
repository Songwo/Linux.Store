package handler

import (
	"net/http"
	"strconv"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/response"
	cardsecretdto "devstore/server/internal/module/cardsecret/dto"
	cardsecretsvc "devstore/server/internal/module/cardsecret/service"
	"github.com/gin-gonic/gin"
)

type Handler struct{ svc *cardsecretsvc.Service }

func New(svc *cardsecretsvc.Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) UserList(c *gin.Context) {
	res, appErr := h.svc.ListUserCards(c.Request.Context(), c.GetUint64("user_id"), c.Query("order_no"))
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) UserReveal(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid card secret id", err))
		return
	}
	res, appErr := h.svc.Reveal(c.Request.Context(), c.GetUint64("user_id"), id, c.ClientIP(), c.Request.UserAgent())
	if appErr != nil {
		status := http.StatusBadRequest
		if appErr.Code == apperr.CodeNotFound {
			status = http.StatusNotFound
		}
		if appErr.Code == apperr.CodeInternalError {
			status = http.StatusInternalServerError
		}
		response.Fail(c, status, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) UserRedeem(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid card secret id", err))
		return
	}
	res, appErr := h.svc.Redeem(c.Request.Context(), c.GetUint64("user_id"), id, c.ClientIP(), c.Request.UserAgent())
	if appErr != nil {
		status := http.StatusBadRequest
		if appErr.Code == apperr.CodeNotFound {
			status = http.StatusNotFound
		}
		if appErr.Code == apperr.CodeInternalError {
			status = http.StatusInternalServerError
		}
		response.Fail(c, status, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) AdminSKUOptions(c *gin.Context) {
	res, appErr := h.svc.AdminListSKUOptions(c.Request.Context())
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) AdminListProfiles(c *gin.Context) {
	res, appErr := h.svc.AdminListProfiles(c.Request.Context())
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) AdminCreateProfile(c *gin.Context) {
	var req cardsecretdto.AdminProfileSaveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid card secret profile params", err))
		return
	}
	res, appErr := h.svc.AdminCreateProfile(c.Request.Context(), req)
	if appErr != nil {
		status := http.StatusBadRequest
		if appErr.Code == apperr.CodeInternalError {
			status = http.StatusInternalServerError
		}
		response.Fail(c, status, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) AdminUpdateProfile(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid card secret profile id", err))
		return
	}
	var req cardsecretdto.AdminProfileSaveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid card secret profile params", err))
		return
	}
	res, appErr := h.svc.AdminUpdateProfile(c.Request.Context(), id, req)
	if appErr != nil {
		status := http.StatusBadRequest
		if appErr.Code == apperr.CodeNotFound {
			status = http.StatusNotFound
		}
		if appErr.Code == apperr.CodeInternalError {
			status = http.StatusInternalServerError
		}
		response.Fail(c, status, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) AdminImportItems(c *gin.Context) {
	var req cardsecretdto.AdminImportItemsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid card secret import params", err))
		return
	}
	res, appErr := h.svc.AdminImportItems(c.Request.Context(), req)
	if appErr != nil {
		status := http.StatusBadRequest
		if appErr.Code == apperr.CodeNotFound {
			status = http.StatusNotFound
		}
		if appErr.Code == apperr.CodeInternalError {
			status = http.StatusInternalServerError
		}
		response.Fail(c, status, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) AdminListItems(c *gin.Context) {
	var query cardsecretdto.AdminItemListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid card secret item query", err))
		return
	}
	res, appErr := h.svc.AdminListItems(c.Request.Context(), query)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) AdminUpdateItemStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid card secret item id", err))
		return
	}
	var req cardsecretdto.AdminItemStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid card secret item status params", err))
		return
	}
	res, appErr := h.svc.AdminUpdateItemStatus(c.Request.Context(), id, req.Status)
	if appErr != nil {
		status := http.StatusBadRequest
		if appErr.Code == apperr.CodeNotFound {
			status = http.StatusNotFound
		}
		if appErr.Code == apperr.CodeInternalError {
			status = http.StatusInternalServerError
		}
		response.Fail(c, status, appErr)
		return
	}
	response.Success(c, res)
}
