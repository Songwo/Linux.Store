package handler

import (
	"net/http"
	"strconv"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/response"
	productdto "devstore/server/internal/module/product/dto"
	productsvc "devstore/server/internal/module/product/service"
	"github.com/gin-gonic/gin"
)

type Handler struct{ svc *productsvc.Service }

func New(svc *productsvc.Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) CategoryList(c *gin.Context) {
	items, err := h.svc.ListCategories(c.Request.Context())
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err)
		return
	}
	response.Success(c, items)
}

func (h *Handler) ProductList(c *gin.Context) {
	var query productdto.ProductListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid query params", err))
		return
	}
	res, appErr := h.svc.ListProducts(c.Request.Context(), query, false)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) ProductDetail(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid product id", err))
		return
	}
	res, appErr := h.svc.GetProductDetail(c.Request.Context(), id)
	if appErr != nil {
		response.Fail(c, http.StatusNotFound, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) AdminProductList(c *gin.Context) {
	var query productdto.ProductListQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid query params", err))
		return
	}
	res, appErr := h.svc.ListProducts(c.Request.Context(), query, true)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) AdminCreateProduct(c *gin.Context) {
	var req productdto.AdminProductCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid create product params", err))
		return
	}
	res, appErr := h.svc.CreateProduct(c.Request.Context(), req)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) AdminUpdateProduct(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid product id", err))
		return
	}
	var req productdto.AdminProductUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid update product params", err))
		return
	}
	res, appErr := h.svc.UpdateProduct(c.Request.Context(), id, req)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}
