package dto

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,password"`
	Nickname string `json:"nickname" binding:"required,min=2,max=32"`
}

type LoginRequest struct {
	Identifier string `json:"identifier" binding:"required"`
	Password   string `json:"password" binding:"required"`
}

type TokenResponse struct {
	Token string      `json:"token"`
	User  interface{} `json:"user"`
}
