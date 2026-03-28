package dto

type BalancePayRequest struct {
	OrderNo       string `json:"order_no" binding:"required"`
	IdempotentKey string `json:"idempotent_key" binding:"required,min=8,max=64"`
}
