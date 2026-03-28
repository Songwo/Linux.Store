package model

import "time"

type AdminUser struct {
	ID          uint64     `gorm:"primaryKey"`
	Username    string     `gorm:"column:username"`
	Password    string     `gorm:"column:password"`
	Nickname    string     `gorm:"column:nickname"`
	Status      int8       `gorm:"column:status"`
	LastLoginAt *time.Time `gorm:"column:last_login_at"`
	CreatedAt   *time.Time  `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt   *time.Time  `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (AdminUser) TableName() string { return "admin_users" }
