package routes

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/ydv-ankit/go-url-shortener/config"
	"github.com/ydv-ankit/go-url-shortener/models"
	"gorm.io/gorm"
)

type CacheUrl struct {
	Long   string    `json:"long"`
	Short  string    `json:"short"`
	Expiry time.Time `json:"expiry"`
}

func ResolveUrl(c *fiber.Ctx) error {
	short := c.Params("short")
	url := new(models.Url)
	url.Short = short

	var tx *gorm.DB

	// check for cache hit
	r, err := config.GetRedisClient(0).Get(config.RedisCtx, short).Result()
	if err == nil {
		cachedUrl := new(CacheUrl)
		err = json.Unmarshal([]byte(r), cachedUrl)
		if err != nil {
			fmt.Println("error unmarshalling url", err)
		}
		url.Expiry = cachedUrl.Expiry
		url.Long = cachedUrl.Long
		url.Short = cachedUrl.Short
	} else {
		tx = config.GetMySQLClient().Begin()
		// cache miss, get from db
		if err := url.GetUrlByShort(tx); err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"message": "Url not found",
				"success": false,
				"error":   "Url not found",
			})
		}
		tx.Commit()
		// set cache
		cacheUrl := new(CacheUrl)
		cacheUrl.Long = url.Long
		cacheUrl.Short = url.Short
		cacheUrl.Expiry = url.Expiry
		jsonData, err := json.Marshal(cacheUrl)
		if err != nil {
			fmt.Println("error marshalling url", err)
		}
		err = config.GetRedisClient(0).Set(config.RedisCtx, short, string(jsonData), time.Minute*30).Err() // 30 minutes TTL
		if err != nil {
			fmt.Println("error setting cache", err)
		}
	}
	// check if url is expired
	if time.Now().After(url.Expiry) {
		return c.Status(fiber.StatusGone).JSON(fiber.Map{
			"message": "Url expired",
			"success": false,
			"error":   "Url expired",
		})
	}
	return c.Redirect(url.Long, fiber.StatusTemporaryRedirect)
}
