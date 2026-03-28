package consumer

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"devstore/server/internal/model"
	"devstore/server/internal/mq/message"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type PaymentSuccessConsumer struct {
	db    *gorm.DB
	redis *redis.Client
	conn  *amqp.Connection
}

func NewPaymentSuccessConsumer(db *gorm.DB, redisClient *redis.Client, conn *amqp.Connection) *PaymentSuccessConsumer {
	return &PaymentSuccessConsumer{db: db, redis: redisClient, conn: conn}
}

func (c *PaymentSuccessConsumer) Start(ctx context.Context) error {
	ch, err := c.conn.Channel()
	if err != nil {
		return err
	}
	if err := ch.ExchangeDeclare(message.ExchangePayment, "direct", true, false, false, false, nil); err != nil {
		return err
	}
	queue, err := ch.QueueDeclare("devstore.payment.success.queue", true, false, false, false, nil)
	if err != nil {
		return err
	}
	if err := ch.QueueBind(queue.Name, message.RoutingPaymentSuccess, message.ExchangePayment, false, nil); err != nil {
		return err
	}
	msgs, err := ch.Consume(queue.Name, "devstore-payment-consumer", false, false, false, false, nil)
	if err != nil {
		return err
	}
	go func() {
		for {
			select {
			case <-ctx.Done():
				_ = ch.Close()
				return
			case msg, ok := <-msgs:
				if !ok {
					return
				}
				if err := c.consumeMessage(ctx, msg); err != nil {
					_ = msg.Nack(false, false)
					continue
				}
				_ = msg.Ack(false)
			}
		}
	}()
	return nil
}

func (c *PaymentSuccessConsumer) consumeMessage(ctx context.Context, msg amqp.Delivery) error {
	consumeKey := fmt.Sprintf("devstore:prod:mq:consume:%s", msg.MessageId)
	ok, err := c.redis.SetNX(ctx, consumeKey, "1", 7*24*time.Hour).Result()
	if err != nil {
		return err
	}
	if !ok {
		return nil
	}

	var envelope message.Envelope
	if err := json.Unmarshal(msg.Body, &envelope); err != nil {
		return err
	}
	payloadBytes, _ := json.Marshal(envelope.Payload)
	var payload struct {
		OrderNo string `json:"order_no"`
		UserID  uint64 `json:"user_id"`
		Reward  int64  `json:"reward"`
	}
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return err
	}

	consumeLog := model.MQConsumeLog{MessageID: msg.MessageId, Consumer: "devstore-payment-consumer", BizKey: envelope.BizKey, Status: 20}
	return c.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var account model.UserPointsAccount
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("user_id = ?", payload.UserID).First(&account).Error; err != nil {
			return err
		}
		newPoints := account.Points + payload.Reward
		if err := tx.Model(&model.UserPointsAccount{}).Where("user_id = ?", payload.UserID).Updates(map[string]interface{}{"points": newPoints, "total_points": account.TotalPoints + payload.Reward, "version": gorm.Expr("version + 1")}).Error; err != nil {
			return err
		}
		flow := model.UserPointsFlow{UserID: payload.UserID, BizType: "pay_reward", BizNo: payload.OrderNo, Direction: 1, Points: payload.Reward, PointsAfter: newPoints, Remark: "payment reward points"}
		if err := tx.Create(&flow).Error; err != nil {
			return err
		}
		if err := tx.Create(&consumeLog).Error; err != nil {
			return err
		}
		return nil
	})
}
