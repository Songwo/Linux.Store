package dto

type OrderItemRequest struct {
	SKUID    uint64 `json:"sku_id" binding:"required"`
	Quantity int    `json:"quantity" binding:"required,min=1,max=10"`
}

type CreateOrderRequest struct {
	Items       []OrderItemRequest `json:"items" binding:"required,min=1"`
	CouponID    *uint64            `json:"coupon_id"`
	UsePoints   bool               `json:"use_points"`
	SubmitToken string             `json:"submit_token" binding:"required,min=8,max=64"`
	Remark      string             `json:"remark"`
}
