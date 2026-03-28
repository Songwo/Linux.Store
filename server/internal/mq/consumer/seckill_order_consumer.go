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

const (
	seckillWorkerCount   = 4
	seckillPrefetchCount = 32
)

type SeckillOrderConsumer struct {
	db    *gorm.DB
	redis *redis.Client
	conn  *amqp.Connection
}

func NewSeckillOrderConsumer(db *gorm.DB, redisClient *redis.Client, conn *amqp.Connection) *SeckillOrderConsumer {
	return &SeckillOrderConsumer{db: db, redis: redisClient, conn: conn}
}

func (c *SeckillOrderConsumer) Start(ctx context.Context) error {
	for workerID := 1; workerID <= seckillWorkerCount; workerID++ {
		if err := c.startWorker(ctx, workerID); err != nil {
			return err
		}
	}
	return nil
}

func (c *SeckillOrderConsumer) startWorker(ctx context.Context, workerID int) error {
	ch, err := c.conn.Channel()
	if err != nil {
		return err
	}
	if err := ch.ExchangeDeclare(message.ExchangeSeckill, "direct", true, false, false, false, nil); err != nil {
		_ = ch.Close()
		return err
	}
	queue, err := ch.QueueDeclare("devstore.seckill.order.queue", true, false, false, false, nil)
	if err != nil {
		_ = ch.Close()
		return err
	}
	if err := ch.QueueBind(queue.Name, message.RoutingSeckillOrder, message.ExchangeSeckill, false, nil); err != nil {
		_ = ch.Close()
		return err
	}
	if err := ch.Qos(seckillPrefetchCount, 0, false); err != nil {
		_ = ch.Close()
		return err
	}

	consumerTag := fmt.Sprintf("devstore-seckill-consumer-%d", workerID)
	msgs, err := ch.Consume(queue.Name, consumerTag, false, false, false, false, nil)
	if err != nil {
		_ = ch.Close()
		return err
	}

	go func() {
		defer func() {
			_ = ch.Cancel(consumerTag, false)
			_ = ch.Close()
		}()
		for {
			select {
			case <-ctx.Done():
				return
			case msg, ok := <-msgs:
				if !ok {
					return
				}
				if err := c.consumeMessage(ctx, ch, msg); err != nil {
					_ = msg.Nack(false, false)
					continue
				}
				_ = msg.Ack(false)
			}
		}
	}()
	return nil
}

func (c *SeckillOrderConsumer) consumeMessage(ctx context.Context, ch *amqp.Channel, msg amqp.Delivery) error {
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
		CampaignID uint64  `json:"campaign_id"`
		SKUID      uint64  `json:"sku_id"`
		UserID     uint64  `json:"user_id"`
		Price      float64 `json:"price"`
	}
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return err
	}

	var sku model.ProductSKU
	if err := c.db.WithContext(ctx).First(&sku, payload.SKUID).Error; err != nil {
		c.compensateReservation(ctx, payload.CampaignID, payload.SKUID, payload.UserID, "failed")
		return err
	}
	var product model.Product
	if err := c.db.WithContext(ctx).First(&product, sku.ProductID).Error; err != nil {
		c.compensateReservation(ctx, payload.CampaignID, payload.SKUID, payload.UserID, "failed")
		return err
	}

	orderNo := fmt.Sprintf("SK%d", time.Now().UnixNano())
	deadline := time.Now().Add(15 * time.Minute)
	campaignID := payload.CampaignID
	order := model.Order{OrderNo: orderNo, UserID: payload.UserID, OrderType: "seckill", Status: 10, TotalAmount: payload.Price, DiscountAmount: 0, PayAmount: payload.Price, Remark: "seckill async order", SubmitToken: fmt.Sprintf("sk-%s", msg.MessageId), CampaignID: &campaignID, PayDeadlineAt: &deadline}
	item := model.OrderItem{OrderNo: orderNo, UserID: payload.UserID, ProductID: product.ID, SKUID: sku.ID, ProductName: product.Name, SKUTitle: sku.Title, Cover: product.Cover, Price: payload.Price, PointsPrice: 0, Quantity: 1, TotalAmount: payload.Price}
	log := model.OrderLog{OrderNo: orderNo, StatusTo: 10, OperatorType: "system", Remark: "seckill order created by mq"}
	consumeLog := model.MQConsumeLog{MessageID: msg.MessageId, Consumer: "devstore-seckill-consumer", BizKey: envelope.BizKey, Status: 20}

	if err := c.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&order).Error; err != nil {
			return err
		}
		item.OrderID = order.ID
		if err := tx.Create(&item).Error; err != nil {
			return err
		}
		if err := tx.Create(&log).Error; err != nil {
			return err
		}
		res := tx.Table("seckill_goods").
			Where("seckill_campaign_id = ? AND sku_id = ? AND available_stock > 0", payload.CampaignID, payload.SKUID).
			UpdateColumn("available_stock", gorm.Expr("available_stock - 1"))
		if res.Error != nil {
			return res.Error
		}
		if res.RowsAffected == 0 {
			return fmt.Errorf("seckill stock in db not enough for campaign %d sku %d", payload.CampaignID, payload.SKUID)
		}
		if err := tx.Create(&consumeLog).Error; err != nil {
			return err
		}
		return nil
	}); err != nil {
		c.compensateReservation(ctx, payload.CampaignID, payload.SKUID, payload.UserID, "failed")
		return err
	}

	closeMsg := message.NewEnvelope(orderNo, "order.close.delay", orderNo, envelope.TraceID, map[string]interface{}{"order_no": orderNo, "user_id": payload.UserID, "order_type": "seckill"})
	closeBody, _ := json.Marshal(closeMsg)
	if err := ch.PublishWithContext(ctx, message.ExchangeDelay, message.RoutingOrderCloseDelay, false, false, amqp.Publishing{ContentType: "application/json", MessageId: closeMsg.MessageID, Body: closeBody, Timestamp: time.Now(), Expiration: fmt.Sprintf("%d", (15 * time.Minute).Milliseconds())}); err != nil {
		return err
	}

	resultKey := fmt.Sprintf("devstore:prod:seckill:result:%d:%d", payload.CampaignID, payload.UserID)
	_ = c.redis.Set(ctx, resultKey, "success:"+orderNo, 24*time.Hour).Err()
	return nil
}

func (c *SeckillOrderConsumer) compensateReservation(ctx context.Context, campaignID, skuID, userID uint64, result string) {
	stockKey := fmt.Sprintf("devstore:prod:seckill:stock:%d:%d", campaignID, skuID)
	buyersKey := fmt.Sprintf("devstore:prod:seckill:buyers:%d:%d", campaignID, skuID)
	resultKey := fmt.Sprintf("devstore:prod:seckill:result:%d:%d", campaignID, userID)
	_ = c.redis.Incr(ctx, stockKey).Err()
	_ = c.redis.SRem(ctx, buyersKey, userID).Err()
	_ = c.redis.Set(ctx, resultKey, result, 24*time.Hour).Err()
}
