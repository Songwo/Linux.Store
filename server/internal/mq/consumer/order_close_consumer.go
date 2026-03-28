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
)

type OrderCloseConsumer struct {
	db    *gorm.DB
	redis *redis.Client
	conn  *amqp.Connection
}

func NewOrderCloseConsumer(db *gorm.DB, redisClient *redis.Client, conn *amqp.Connection) *OrderCloseConsumer {
	return &OrderCloseConsumer{db: db, redis: redisClient, conn: conn}
}

func (c *OrderCloseConsumer) Start(ctx context.Context) error {
	ch, err := c.conn.Channel()
	if err != nil {
		return err
	}
	if err := ch.ExchangeDeclare(message.ExchangeDelay, "direct", true, false, false, false, nil); err != nil {
		return err
	}
	if err := ch.ExchangeDeclare(message.ExchangeDLX, "direct", true, false, false, false, nil); err != nil {
		return err
	}
	_, err = ch.QueueDeclare("devstore.order.close.delay.queue", true, false, false, false, amqp.Table{"x-dead-letter-exchange": message.ExchangeDLX, "x-dead-letter-routing-key": message.RoutingOrderClose})
	if err != nil {
		return err
	}
	if err := ch.QueueBind("devstore.order.close.delay.queue", message.RoutingOrderCloseDelay, message.ExchangeDelay, false, nil); err != nil {
		return err
	}
	_, err = ch.QueueDeclare("devstore.order.close.queue", true, false, false, false, nil)
	if err != nil {
		return err
	}
	if err := ch.QueueBind("devstore.order.close.queue", message.RoutingOrderClose, message.ExchangeDLX, false, nil); err != nil {
		return err
	}
	msgs, err := ch.Consume("devstore.order.close.queue", "devstore-order-close-consumer", false, false, false, false, nil)
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

func (c *OrderCloseConsumer) consumeMessage(ctx context.Context, msg amqp.Delivery) error {
	consumeKey := fmt.Sprintf("devstore:prod:mq:consume:%s", msg.MessageId+":close")
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
		OrderNo   string `json:"order_no"`
		UserID    uint64 `json:"user_id"`
		OrderType string `json:"order_type"`
	}
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return err
	}

	var order model.Order
	if err := c.db.WithContext(ctx).Where("order_no = ?", payload.OrderNo).First(&order).Error; err != nil {
		return err
	}
	if order.Status != 10 {
		return nil
	}

	var items []model.OrderItem
	if err := c.db.WithContext(ctx).Where("order_no = ?", payload.OrderNo).Find(&items).Error; err != nil {
		return err
	}

	if err := c.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&model.Order{}).Where("order_no = ? AND status = ?", payload.OrderNo, 10).Updates(map[string]interface{}{"status": 40, "closed_at": time.Now()}).Error; err != nil {
			return err
		}
		if order.CouponID != nil {
			if err := tx.Model(&model.UserCoupon{}).
				Where("id = ? AND order_no = ? AND status = ?", *order.CouponID, payload.OrderNo, 20).
				Updates(map[string]interface{}{"status": 10, "order_no": "", "used_at": nil}).Error; err != nil {
				return err
			}
		}
		if order.OrderType == "seckill" && order.CampaignID != nil {
			for _, item := range items {
				if err := tx.Model(&model.SeckillGood{}).
					Where("seckill_campaign_id = ? AND sku_id = ?", *order.CampaignID, item.SKUID).
					UpdateColumn("available_stock", gorm.Expr("CASE WHEN available_stock + ? > stock THEN stock ELSE available_stock + ? END", item.Quantity, item.Quantity)).Error; err != nil {
					return err
				}
			}
		}
		return nil
	}); err != nil {
		return err
	}

	if order.OrderType == "seckill" && order.CampaignID != nil {
		for _, item := range items {
			stockKey := fmt.Sprintf("devstore:prod:seckill:stock:%d:%d", *order.CampaignID, item.SKUID)
			buyersKey := fmt.Sprintf("devstore:prod:seckill:buyers:%d:%d", *order.CampaignID, item.SKUID)
			_ = c.redis.IncrBy(ctx, stockKey, int64(item.Quantity)).Err()
			_ = c.redis.SRem(ctx, buyersKey, order.UserID).Err()
		}
		resultKey := fmt.Sprintf("devstore:prod:seckill:result:%d:%d", *order.CampaignID, order.UserID)
		_ = c.redis.Set(ctx, resultKey, "closed", 24*time.Hour).Err()
	}
	return nil
}
