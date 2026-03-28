package types

type UserClaims struct {
	UserID   uint64 `json:"user_id"`
	Email    string `json:"email"`
	Nickname string `json:"nickname"`
	Role     string `json:"role"`
}
