package dto

import "time"

type AddCartItemRequest struct {
	SKUID    uint64 `json:"sku_id" binding:"required"`
	Quantity int    `json:"quantity" binding:"required,min=1,max=99"`
	Checked  int8   `json:"checked"`
}

type CartItemResponse struct {
	ID          uint64    `json:"id"`
	SKUID       uint64    `json:"sku_id"`
	Quantity    int       `json:"quantity"`
	Checked     int8      `json:"checked"`
	ProductName string    `json:"product_name"`
	Cover       string    `json:"cover"`
	Price       float64   `json:"price"`
	PointsPrice int64     `json:"points_price"`
	SKUTitle    string    `json:"sku_title"`
	CreatedAt   *time.Time `json:"created_at,omitempty"`
	UpdatedAt   *time.Time `json:"updated_at,omitempty"`
}
type UpdateCartItemCheckedRequest struct {
	Checked int8 `json:"checked"`
}

type UpdateCartItemQuantityRequest struct {
	Quantity int `json:"quantity" binding:"required,min=1"`
}
