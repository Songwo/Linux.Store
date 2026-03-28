package handler

import (
	"net/http"
	"strconv"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/response"
	"devstore/server/internal/model"
	seckilldto "devstore/server/internal/module/seckill/dto"
	seckillsvc "devstore/server/internal/module/seckill/service"
	"github.com/gin-gonic/gin"
)

type Handler struct{ svc *seckillsvc.Service }

func New(svc *seckillsvc.Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) ListGoods(c *gin.Context) {
	res, appErr := h.svc.ListActiveGoods(c.Request.Context())
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) Warmup(c *gin.Context) {
	campaignID, err := strconv.ParseUint(c.Param("campaignId"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid campaign id", err))
		return
	}
	res, appErr := h.svc.Warmup(c.Request.Context(), campaignID)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) Purchase(c *gin.Context) {
	var req seckilldto.PurchaseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid seckill params", err))
		return
	}
	res, appErr := h.svc.Purchase(c.Request.Context(), c.GetUint64("user_id"), req, c.GetString("request_id"))
	if appErr != nil {
		response.Fail(c, http.StatusBadRequest, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) Result(c *gin.Context) {
	campaignID, err := strconv.ParseUint(c.Query("campaign_id"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid campaign id", err))
		return
	}
	res, appErr := h.svc.QueryResult(c.Request.Context(), c.GetUint64("user_id"), campaignID)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

// Admin Methods

func (h *Handler) AdminListCampaigns(c *gin.Context) {
	res, appErr := h.svc.AdminListCampaigns(c.Request.Context())
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) AdminCreateCampaign(c *gin.Context) {
	var req model.SeckillCampaign
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid params", err))
		return
	}
	appErr := h.svc.CreateCampaign(c.Request.Context(), &req)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, nil)
}

func (h *Handler) AdminUpdateCampaign(c *gin.Context) {
	var req model.SeckillCampaign
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid params", err))
		return
	}
	appErr := h.svc.UpdateCampaign(c.Request.Context(), &req)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, nil)
}

func (h *Handler) AdminDeleteCampaign(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("campaignId"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid id", err))
		return
	}
	appErr := h.svc.DeleteCampaign(c.Request.Context(), id)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, nil)
}

func (h *Handler) AdminListGoods(c *gin.Context) {
	campaignID, err := strconv.ParseUint(c.Query("campaign_id"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid campaign id", err))
		return
	}
	res, appErr := h.svc.AdminListGoods(c.Request.Context(), campaignID)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) AdminAddGood(c *gin.Context) {
	var req model.SeckillGood
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid params", err))
		return
	}
	appErr := h.svc.AddGood(c.Request.Context(), &req)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, nil)
}

func (h *Handler) AdminUpdateGood(c *gin.Context) {
	var req model.SeckillGood
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid params", err))
		return
	}
	appErr := h.svc.UpdateGood(c.Request.Context(), &req)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, nil)
}

func (h *Handler) AdminDeleteGood(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid id", err))
		return
	}
	appErr := h.svc.DeleteGood(c.Request.Context(), id)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, nil)
}
