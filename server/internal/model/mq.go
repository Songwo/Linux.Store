package model

import "time"

type OrderLog struct {
	ID           uint64    `gorm:"primaryKey" json:"id"`
	OrderNo      string    `gorm:"column:order_no" json:"order_no"`
	StatusFrom   *int8     `gorm:"column:status_from" json:"status_from,omitempty"`
	StatusTo     int8      `gorm:"column:status_to" json:"status_to"`
	OperatorType string    `gorm:"column:operator_type" json:"operator_type"`
	OperatorID   *uint64   `gorm:"column:operator_id" json:"operator_id,omitempty"`
	Remark       string    `gorm:"column:remark" json:"remark"`
	CreatedAt    *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
}

func (OrderLog) TableName() string { return "order_logs" }

type MQConsumeLog struct {
	ID         uint64    `gorm:"primaryKey" json:"id"`
	MessageID  string    `gorm:"column:message_id" json:"message_id"`
	Consumer   string    `gorm:"column:consumer" json:"consumer"`
	BizKey     string    `gorm:"column:biz_key" json:"biz_key"`
	Status     int8      `gorm:"column:status" json:"status"`
	RetryCount int       `gorm:"column:retry_count" json:"retry_count"`
	ErrorMsg   string    `gorm:"column:error_msg" json:"error_msg"`
	CreatedAt  *time.Time `gorm:"column:created_at" json:"created_at,omitempty"`
	UpdatedAt  *time.Time `gorm:"column:updated_at" json:"updated_at,omitempty"`
}

func (MQConsumeLog) TableName() string { return "mq_consume_logs" }
