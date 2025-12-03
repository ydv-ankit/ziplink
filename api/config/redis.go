package config

import (
	"context"
	"os"

	"github.com/redis/go-redis/v9"
)

// for external use
var RedisCtx = context.Background()

// main func to create redis client
func CreateClient(dbNo int) *redis.Client {
	rdb := redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_ADDR"),
		Password: os.Getenv("REDIS_PASS"),
		DB:       dbNo,
	})

	return rdb
}
