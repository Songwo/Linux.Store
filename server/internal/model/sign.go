package model

import "time"

type UserSignRecord struct {
	ID           uint64    `gorm:"primaryKey" json:"id"`
	UserID       uint64    `gorm:"column:user_id" json:"user_id"`
	SignDate     *time.Time `gorm:"column:sign_date" json:"sign_date,omitempty"`
	StreakDays   int       `gorm:"column:streak_days" json:"streak_days"`
	RewardPoints int64     `gorm:"column:reward_points" json:"reward_points"`
	CreatedAt    *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
}

func (UserSignRecord) TableName() string { return "user_sign_records" }
