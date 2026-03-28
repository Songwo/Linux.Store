package redisx

import (
	"context"
	"fmt"

	"devstore/server/internal/config"
	"github.com/redis/go-redis/v9"
)

func New(cfg config.RedisConfig) (*redis.Client, error) {
	client := redis.NewClient(&redis.Options{Addr: cfg.Addr, Password: cfg.Password, DB: cfg.DB, PoolSize: cfg.PoolSize})
	if err := client.Ping(context.Background()).Err(); err != nil {
		return nil, fmt.Errorf("ping redis failed: %w", err)
	}
	return client, nil
}
