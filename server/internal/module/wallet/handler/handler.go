package handler

import (
	"net/http"
	"strconv"

	"devstore/server/internal/common/response"
	walletsvc "devstore/server/internal/module/wallet/service"
	"github.com/gin-gonic/gin"
)

type Handler struct{ svc *walletsvc.Service }

func New(svc *walletsvc.Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) Summary(c *gin.Context) {
	res, appErr := h.svc.Summary(c.Request.Context(), c.GetUint64("user_id"))
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) Flows(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	res, appErr := h.svc.Flows(c.Request.Context(), c.GetUint64("user_id"), c.Query("biz_type"), c.DefaultQuery("type", "all"), c.Query("date_from"), c.Query("date_to"), page, pageSize)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}
