package handler

import (
	"net/http"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/response"
	oauthdto "devstore/server/internal/module/oauth/dto"
	oauthsvc "devstore/server/internal/module/oauth/service"
	"github.com/gin-gonic/gin"
)

type Handler struct{ svc *oauthsvc.Service }

func New(svc *oauthsvc.Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) Authorize(c *gin.Context) {
	response.Success(c, gin.H{"authorize_url": h.svc.AuthorizeURL("devstore-oauth-state")})
}

func (h *Handler) Callback(c *gin.Context) {
	var query oauthdto.CallbackQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid oauth callback params", err))
		return
	}
	res, err := h.svc.HandleCallback(c.Request.Context(), query.Code)
	if err != nil {
		response.Fail(c, http.StatusBadGateway, apperr.Wrap(apperr.CodeInternalError, "linux.do oauth callback failed", err))
		return
	}
	response.Success(c, res)
}

func (h *Handler) Bind(c *gin.Context) {
	var req oauthdto.BindRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid bind params", err))
		return
	}
	res, appErr := h.svc.BindCurrentUser(c.Request.Context(), c.GetUint64("user_id"), req.Code)
	if appErr != nil {
		response.Fail(c, http.StatusBadRequest, appErr)
		return
	}
	response.Success(c, res)
}
