package rabbitmqx

import (
	"fmt"

	"devstore/server/internal/config"
	amqp "github.com/rabbitmq/amqp091-go"
)

func New(cfg config.RabbitMQConfig) (*amqp.Connection, error) {
	conn, err := amqp.Dial(cfg.URL)
	if err != nil {
		return nil, fmt.Errorf("dial rabbitmq failed: %w", err)
	}
	return conn, nil
}
