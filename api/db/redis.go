package db

import (
	"context"
	"os"

	"github.com/redis/go-redis/v9"
)

// for external use
var RedisCtx = context.Background()

// main func to create redis client
func CreateClient() *redis.Client {
	rdb := redis.NewClient(&redis.Options{
		Addr:     os.Getenv("DB_ADDR"),
		Password: os.Getenv("DB_PASS"),
		DB:       0,
	})

	return rdb
}
