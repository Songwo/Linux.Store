package producer

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"devstore/server/internal/mq/message"
	amqp "github.com/rabbitmq/amqp091-go"
)

type PublishOption func(*amqp.Publishing)

const defaultChannelPoolSize = 16

type Producer struct {
	conn     *amqp.Connection
	channels chan *amqp.Channel
}

func New(conn *amqp.Connection) *Producer {
	return &Producer{
		conn:     conn,
		channels: make(chan *amqp.Channel, defaultChannelPoolSize),
	}
}

func WithExpiration(d time.Duration) PublishOption {
	return func(p *amqp.Publishing) {
		p.Expiration = fmt.Sprintf("%d", d.Milliseconds())
	}
}

func (p *Producer) Publish(ctx context.Context, exchange, routingKey string, msg message.Envelope, opts ...PublishOption) error {
	body, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("marshal message failed: %w", err)
	}

	ch, err := p.acquireChannel()
	if err != nil {
		return fmt.Errorf("open channel failed: %w", err)
	}

	publishing := amqp.Publishing{ContentType: "application/json", MessageId: msg.MessageID, Body: body, Timestamp: time.Now()}
	for _, opt := range opts {
		opt(&publishing)
	}

	if err := ch.PublishWithContext(ctx, exchange, routingKey, false, false, publishing); err != nil {
		p.discardChannel(ch)
		return fmt.Errorf("publish message failed: %w", err)
	}

	p.releaseChannel(ch)
	return nil
}

func (p *Producer) acquireChannel() (*amqp.Channel, error) {
	select {
	case ch := <-p.channels:
		if ch != nil {
			return ch, nil
		}
	default:
	}
	return p.conn.Channel()
}

func (p *Producer) releaseChannel(ch *amqp.Channel) {
	if ch == nil {
		return
	}
	select {
	case p.channels <- ch:
	default:
		_ = ch.Close()
	}
}

func (p *Producer) discardChannel(ch *amqp.Channel) {
	if ch != nil {
		_ = ch.Close()
	}
}
