package model

import "time"

type UserPointsAccount struct {
	ID          uint64    `gorm:"primaryKey" json:"id"`
	UserID      uint64    `gorm:"column:user_id" json:"user_id"`
	Points      int64     `gorm:"column:points" json:"points"`
	TotalPoints int64     `gorm:"column:total_points" json:"total_points"`
	UsedPoints  int64     `gorm:"column:used_points" json:"used_points"`
	Version     int64     `gorm:"column:version" json:"version"`
	CreatedAt   *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt   *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (UserPointsAccount) TableName() string { return "user_points_accounts" }

type UserPointsFlow struct {
	ID          uint64    `gorm:"primaryKey" json:"id"`
	UserID      uint64    `gorm:"column:user_id" json:"user_id"`
	BizType     string    `gorm:"column:biz_type" json:"biz_type"`
	BizNo       string    `gorm:"column:biz_no" json:"biz_no"`
	Direction   int8      `gorm:"column:direction" json:"direction"`
	Points      int64     `gorm:"column:points" json:"points"`
	PointsAfter int64     `gorm:"column:points_after" json:"points_after"`
	Remark      string    `gorm:"column:remark" json:"remark"`
	CreatedAt   *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
}

func (UserPointsFlow) TableName() string { return "user_points_flows" }
