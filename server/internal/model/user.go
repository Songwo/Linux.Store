package model

import "time"

type User struct {
	ID          uint64     `gorm:"primaryKey"`
	UUID        string     `gorm:"column:uuid"`
	Email       *string    `gorm:"column:email"`
	Mobile      *string    `gorm:"column:mobile"`
	Nickname    string     `gorm:"column:nickname"`
	Avatar      string     `gorm:"column:avatar"`
	Status      int8       `gorm:"column:status"`
	Source      string     `gorm:"column:source"`
	LastLoginAt *time.Time `gorm:"column:last_login_at"`
	LastLoginIP *string    `gorm:"column:last_login_ip"`
	CreatedAt   *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt   *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
	DeletedAt   *time.Time `gorm:"column:deleted_at" json:"deleted_at,omitempty"`
}

func (User) TableName() string { return "users" }

type UserAuth struct {
	ID         uint64    `gorm:"primaryKey"`
	UserID     uint64    `gorm:"column:user_id"`
	AuthType   string    `gorm:"column:auth_type"`
	Identifier string    `gorm:"column:identifier"`
	Credential string    `gorm:"column:credential"`
	Verified   int8      `gorm:"column:verified"`
	CreatedAt  *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt  *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (UserAuth) TableName() string { return "user_auths" }
