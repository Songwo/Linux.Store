package dto

type AdminProfileSaveRequest struct {
	SKUID          uint64 `json:"sku_id" binding:"required"`
	ProfileName    string `json:"profile_name"`
	ProductURL     string `json:"product_url"`
	RedeemURL      string `json:"redeem_url"`
	GuideText      string `json:"guide_text"`
	PrivacyNote    string `json:"privacy_note"`
	SupportContact string `json:"support_contact"`
	Status         int8   `json:"status"`
}

type AdminImportItem struct {
	CardCode     string `json:"card_code"`
	CardPassword string `json:"card_password"`
	RedeemCode   string `json:"redeem_code"`
	ExtraNote    string `json:"extra_note"`
}

type AdminImportItemsRequest struct {
	ProfileID uint64            `json:"profile_id" binding:"required"`
	BatchNo   string            `json:"batch_no"`
	Items     []AdminImportItem `json:"items" binding:"required"`
}

type AdminItemStatusRequest struct {
	Status int8 `json:"status" binding:"required"`
}

type AdminItemListQuery struct {
	ProfileID uint64 `form:"profile_id"`
	Status    string `form:"status"`
	Keyword   string `form:"keyword"`
	Page      int    `form:"page"`
	PageSize  int    `form:"page_size"`
}
