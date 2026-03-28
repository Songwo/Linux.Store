package dto

type ListQuery struct {
	Status string `form:"status"`
	Page   int    `form:"page,default=1"`
	PageSize int  `form:"page_size,default=10"`
}

type AdminUpsertRequest struct {
	Title   string `json:"title" binding:"required,min=2,max=80"`
	Content string `json:"content" binding:"required,min=2,max=500"`
	Link    string `json:"link"`
	Level   string `json:"level"`
	Sort    int    `json:"sort"`
	Pinned  int8   `json:"pinned"`
	Status  int8   `json:"status"`
	StartAt string `json:"start_at"`
	EndAt   string `json:"end_at"`
}
