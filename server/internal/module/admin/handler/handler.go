package handler

import (
	"net/http"
	"strconv"

	apperr "devstore/server/internal/common/errors"
	"devstore/server/internal/common/response"
	adminsvc "devstore/server/internal/module/admin/service"
	"github.com/gin-gonic/gin"
)

type Handler struct{ svc *adminsvc.Service }

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type WalletAdjustRequest struct {
	Amount float64 `json:"amount" binding:"required"`
	Remark string  `json:"remark"`
}

func New(svc *adminsvc.Service) *Handler { return &Handler{svc: svc} }

func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid params", err))
		return
	}
	res, appError := h.svc.Login(c.Request.Context(), req.Username, req.Password)
	if appError != nil {
		response.Fail(c, http.StatusUnauthorized, appError)
		return
	}
	response.Success(c, res)
}

func (h *Handler) Dashboard(c *gin.Context) {
	res, appErr := h.svc.Dashboard(c.Request.Context())
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) UserList(c *gin.Context) {
	page, pageSize := parsePage(c)
	res, appErr := h.svc.ListUsers(c.Request.Context(), c.Query("keyword"), page, pageSize)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) AdjustUserWallet(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid user id", err))
		return
	}
	var req WalletAdjustRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid wallet adjust params", err))
		return
	}
	res, appErr := h.svc.AdjustUserWallet(c.Request.Context(), userID, req.Amount, req.Remark, c.GetUint64("user_id"))
	if appErr != nil {
		response.Fail(c, http.StatusBadRequest, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) OrderList(c *gin.Context) {
	page, pageSize := parsePage(c)
	res, appErr := h.svc.ListOrders(c.Request.Context(), c.Query("status"), c.Query("keyword"), page, pageSize)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

type InventoryAdjustRequest struct {
	Delta int64 `json:"delta" binding:"required"`
}

func (h *Handler) AdjustInventory(c *gin.Context) {
	skuID := parseUint64(c.Param("skuId"))
	if skuID == 0 {
		response.Fail(c, http.StatusBadRequest, apperr.New(apperr.CodeValidationError, "invalid sku_id"))
		return
	}
	var req InventoryAdjustRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, apperr.Wrap(apperr.CodeValidationError, "invalid params", err))
		return
	}
	res, appErr := h.svc.AdjustInventory(c.Request.Context(), skuID, req.Delta)
	if appErr != nil {
		response.Fail(c, http.StatusBadRequest, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) OrderDetail(c *gin.Context) {
	res, appErr := h.svc.OrderDetail(c.Request.Context(), c.Param("orderNo"))
	if appErr != nil {
		status := http.StatusInternalServerError
		if appErr.Code == apperr.CodeNotFound {
			status = http.StatusNotFound
		}
		response.Fail(c, status, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) InventoryList(c *gin.Context) {
	page, pageSize := parsePage(c)
	res, appErr := h.svc.ListInventory(c.Request.Context(), c.Query("keyword"), page, pageSize)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) BalanceFlowList(c *gin.Context) {
	page, pageSize := parsePage(c)
	res, appErr := h.svc.ListBalanceFlows(c.Request.Context(), parseUint64(c.Query("user_id")), page, pageSize)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) PointsFlowList(c *gin.Context) {
	page, pageSize := parsePage(c)
	res, appErr := h.svc.ListPointsFlows(c.Request.Context(), parseUint64(c.Query("user_id")), page, pageSize)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func (h *Handler) OperationLogList(c *gin.Context) {
	page, pageSize := parsePage(c)
	res, appErr := h.svc.ListOperationLogs(c.Request.Context(), c.Query("module"), page, pageSize)
	if appErr != nil {
		response.Fail(c, http.StatusInternalServerError, appErr)
		return
	}
	response.Success(c, res)
}

func parsePage(c *gin.Context) (int, int) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}
	return page, pageSize
}

func parseUint64(value string) uint64 {
	parsed, _ := strconv.ParseUint(value, 10, 64)
	return parsed
}
