package model

import "time"

type OAuthBinding struct {
	ID               uint64     `gorm:"primaryKey" json:"id"`
	UserID           uint64     `gorm:"column:user_id" json:"user_id"`
	Provider         string     `gorm:"column:provider" json:"provider"`
	ProviderUserID   string     `gorm:"column:provider_user_id" json:"provider_user_id"`
	ProviderUsername string     `gorm:"column:provider_username" json:"provider_username"`
	AccessToken      string     `gorm:"column:access_token" json:"access_token"`
	RefreshToken     string     `gorm:"column:refresh_token" json:"refresh_token"`
	ExpiresAt        *time.Time `gorm:"column:expires_at" json:"expires_at,omitempty"`
	RawProfile       string     `gorm:"column:raw_profile" json:"raw_profile"`
	CreatedAt        *time.Time  `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt        *time.Time  `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (OAuthBinding) TableName() string { return "oauth_bindings" }
