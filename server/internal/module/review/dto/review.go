package dto

import "time"

type CreateReviewRequest struct {
	Rating  int8   `json:"rating" binding:"required,min=1,max=5"`
	Content string `json:"content" binding:"required,max=1000"`
}

type ReviewItem struct {
	ID        uint64     `json:"id"`
	ProductID uint64     `json:"product_id"`
	UserID    uint64     `json:"user_id"`
	Nickname  string     `json:"nickname"`
	Avatar    string     `json:"avatar"`
	Rating    int8       `json:"rating"`
	Content   string     `json:"content"`
	CreatedAt *time.Time `json:"created_at"`
}

type ReviewListQuery struct {
	Page     int `form:"page,default=1" binding:"min=1"`
	PageSize int `form:"page_size,default=10" binding:"min=1,max=100"`
}

type ReviewListResponse struct {
	List     []ReviewItem `json:"list"`
	Total    int64        `json:"total"`
	Page     int          `json:"page"`
	PageSize int          `json:"page_size"`
}
