package handler

import (
	"net/http"
	"strconv"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/response"
	reviewdto "devstore/server/internal/module/review/dto"
	reviewsvc "devstore/server/internal/module/review/service"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc *reviewsvc.Service
}

func New(svc *reviewsvc.Service) *Handler {
	return &Handler{svc: svc}
}

// CreateReview handles POST /user/products/:id/reviews
func (h *Handler) CreateReview(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid product id", err))
		return
	}

	var req reviewdto.CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid params", err))
		return
	}

	userID := c.GetUint64("user_id")
	if appErr := h.svc.CreateReview(c.Request.Context(), userID, productID, req); appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}

	response.Success(c, gin.H{"ok": true})
}

// ListReviews handles GET /products/:id/reviews
func (h *Handler) ListReviews(c *gin.Context) {
	productID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid product id", err))
		return
	}

	var query reviewdto.ReviewListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid query params", err))
		return
	}

	res, appErr := h.svc.ListReviews(c.Request.Context(), productID, query)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}
