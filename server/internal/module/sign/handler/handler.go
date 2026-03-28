package handler

import (
	"net/http"

	"devstore/server/internal/common/response"
	signsvc "devstore/server/internal/module/sign/service"
	"github.com/gin-gonic/gin"
)

type Handler struct{ svc *signsvc.Service }

func New(svc *signsvc.Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) Status(c *gin.Context) {
	res, appErr := h.svc.Status(c.Request.Context(), c.GetUint64("user_id"))
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) Sign(c *gin.Context) {
	res, appErr := h.svc.Sign(c.Request.Context(), c.GetUint64("user_id"))
	if appErr != nil {
		response.Fail(c, http.StatusBadRequest, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) History(c *gin.Context) {
	res, appErr := h.svc.History(c.Request.Context(), c.GetUint64("user_id"), c.Query("month"))
	if appErr != nil {
		response.Fail(c, http.StatusBadRequest, appErr)
		return
	}
	response.Success(c, res)
}
