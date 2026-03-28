package model

import "time"

type OperationLog struct {
	ID           uint64    `gorm:"primaryKey" json:"id"`
	OperatorID   *uint64   `gorm:"column:operator_id" json:"operator_id,omitempty"`
	OperatorType string    `gorm:"column:operator_type" json:"operator_type"`
	Module       string    `gorm:"column:module" json:"module"`
	Action       string    `gorm:"column:action" json:"action"`
	BizNo        string    `gorm:"column:biz_no" json:"biz_no"`
	Method       string    `gorm:"column:method" json:"method"`
	Path         string    `gorm:"column:path" json:"path"`
	IP           string    `gorm:"column:ip" json:"ip"`
	RequestBody  string    `gorm:"column:request_body" json:"request_body"`
	ResponseBody string    `gorm:"column:response_body" json:"response_body"`
	CreatedAt    *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
}

func (OperationLog) TableName() string { return "operation_logs" }
