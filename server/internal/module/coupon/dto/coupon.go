package dto

type ClaimCouponRequest struct {
	TemplateID uint64 `json:"template_id" binding:"required"`
}

type CreateCouponTemplateRequest struct {
	Name            string  `json:"name" binding:"required,min=2,max=128"`
	Type            string  `json:"type" binding:"required"`
	Total           int     `json:"total" binding:"required,min=1"`
	Amount          float64 `json:"amount" binding:"required,min=0"`
	ThresholdAmount float64 `json:"threshold_amount" binding:"required,min=0"`
	PointsCost      int64   `json:"points_cost"`
	StartAt         string  `json:"start_at" binding:"required"`
	EndAt           string  `json:"end_at" binding:"required"`
	Description     string  `json:"description"`
}
