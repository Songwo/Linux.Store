package dto

type ProductListQuery struct {
	Keyword    string `form:"keyword"`
	Type       string `form:"type"`
	CategoryID uint64 `form:"category_id"`
	Sort       string `form:"sort"`
	Order      string `form:"order"`
	Page       int    `form:"page,default=1"`
	PageSize   int    `form:"page_size,default=10"`
}

type AdminProductCreateRequest struct {
	CategoryID   uint64  `json:"category_id" binding:"required"`
	Name         string  `json:"name" binding:"required,min=2,max=128"`
	Subtitle     string  `json:"subtitle"`
	Type         string  `json:"type" binding:"required"`
	Cover        string  `json:"cover"`
	Description  string  `json:"description"`
	Price        float64 `json:"price" binding:"required"`
	OriginPrice  float64 `json:"origin_price"`
	PointsPrice  int64   `json:"points_price"`
	Stock        int64   `json:"stock"`
	LimitPerUser int     `json:"limit_per_user"`
	Status       int8    `json:"status"`
	IsHot        int8    `json:"is_hot"`
	IsRecommend  int8    `json:"is_recommend"`
}

type AdminProductUpdateRequest = AdminProductCreateRequest

type ProductItem struct {
	ID           uint64  `json:"id"`
	CategoryID   uint64  `json:"category_id"`
	CategoryName string  `json:"category_name"`
	DefaultSKUID uint64  `json:"default_sku_id"`
	Name         string  `json:"name"`
	Subtitle     string  `json:"subtitle"`
	Type         string  `json:"type"`
	Cover        string  `json:"cover"`
	Price        float64 `json:"price"`
	OriginPrice  float64 `json:"origin_price"`
	PointsPrice  int64   `json:"points_price"`
	Stock        int64   `json:"stock"`
	Status       int8    `json:"status"`
	IsHot        int8    `json:"is_hot"`
	IsRecommend  int8    `json:"is_recommend"`
	Rating       float64 `json:"rating"`
	ReviewCount  int     `json:"review_count"`
	SalesCount   int64   `json:"sales_count"`
	ViewCount    int64   `json:"view_count"`
}

type ProductListResponse struct {
	List     []ProductItem `json:"list"`
	Total    int64         `json:"total"`
	Page     int           `json:"page"`
	PageSize int           `json:"page_size"`
}
