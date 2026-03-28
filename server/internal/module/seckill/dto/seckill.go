package dto

type PurchaseRequest struct {
	CampaignID uint64 `json:"campaign_id" binding:"required"`
	SKUID      uint64 `json:"sku_id" binding:"required"`
}
