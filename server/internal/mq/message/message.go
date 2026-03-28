package message

import "time"

type Envelope struct {
	MessageID string      `json:"message_id"`
	Event     string      `json:"event"`
	BizKey    string      `json:"biz_key"`
	TraceID   string      `json:"trace_id"`
	Timestamp int64       `json:"timestamp"`
	Payload   interface{} `json:"payload"`
}

func NewEnvelope(messageID, event, bizKey, traceID string, payload interface{}) Envelope {
	return Envelope{MessageID: messageID, Event: event, BizKey: bizKey, TraceID: traceID, Timestamp: time.Now().Unix(), Payload: payload}
}

const (
	ExchangeOrder   = "devstore.order.exchange"
	ExchangePayment = "devstore.payment.exchange"
	ExchangePoints  = "devstore.points.exchange"
	ExchangeSeckill = "devstore.seckill.exchange"
	ExchangeDelay   = "devstore.delay.exchange"
	ExchangeDLX     = "devstore.dlx.exchange"

	RoutingSeckillOrder    = "seckill.order.create"
	RoutingOrderCloseDelay = "order.close.delay"
	RoutingOrderClose      = "order.close"
	RoutingPaymentSuccess  = "payment.success"
	RoutingPointsGrant     = "points.grant"
)
