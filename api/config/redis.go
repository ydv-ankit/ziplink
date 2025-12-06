package config

import (
	"context"
	"os"

	"github.com/redis/go-redis/v9"
)

// for external use
var RedisCtx = context.Background()
var RedisClient *redis.Client

// main func to create redis client
func createRedisClient(dbNo int) *redis.Client {
	rdb := redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_ADDR"),
		Password: os.Getenv("REDIS_PASS"),
		DB:       dbNo,
	})

	return rdb
}

func GetRedisClient(dbNo int) *redis.Client {
	if RedisClient == nil {
		RedisClient = createRedisClient(dbNo)
	}
	return RedisClient
}
