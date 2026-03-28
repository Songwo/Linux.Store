package handler

import (
	"net/http"

	"devstore/server/internal/common/response"
	usersvc "devstore/server/internal/module/user/service"
	"github.com/gin-gonic/gin"
)

type Handler struct{ svc *usersvc.Service }

func New(svc *usersvc.Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) Profile(c *gin.Context) {
	res, appErr := h.svc.Profile(c.Request.Context(), c.GetUint64("user_id"))
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) Center(c *gin.Context) {
	res, appErr := h.svc.Center(c.Request.Context(), c.GetUint64("user_id"))
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}
