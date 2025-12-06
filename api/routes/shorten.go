package routes

import (
	"errors"
	"fmt"
	"math/rand"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/ydv-ankit/go-url-shortener/config"
	"github.com/ydv-ankit/go-url-shortener/models"
	"gorm.io/gorm"
)

const (
	SHORT_URL_RETRY_LIMIT = 10
	SHORT_URL_LENGTH      = 7
)

func generateShortUrl(tx *gorm.DB, retry int) (string, error) {
	if retry > SHORT_URL_RETRY_LIMIT {
		return "", errors.New("failed to generate short url")
	}
	// generate random string of 7 characters using base62
	random := rand.New(rand.NewSource(time.Now().UnixNano()))
	chars := "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	shortUrl := make([]byte, SHORT_URL_LENGTH)
	for i := range shortUrl {
		shortUrl[i] = chars[random.Intn(len(chars))]
	}
	// check if short url already exists using the transaction to ensure atomicity
	if err := (&models.Url{Short: string(shortUrl)}).GetUrlByShort(tx); err == nil {
		fmt.Println("short url already exists", string(shortUrl))
		return generateShortUrl(tx, retry+1)
	}
	return string(shortUrl), nil
}

func ShortenUrl(c *fiber.Ctx) error {
	url := new(models.Url)
	err := c.BodyParser(url)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
			"success": false,
			"error":   err.Error(),
		})
	}
	userId := c.Locals("userId").(string)
	url.UserId = userId
	tx := config.GetMySQLClient().Begin()
	// create short url using the transaction to ensure atomicity
	shortUrl, err := generateShortUrl(tx, 0)
	if err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to generate short url",
			"success": false,
			"error":   err.Error(),
		})
	}
	url.Short = shortUrl
	// create new url
	if err := url.CreateUrl(tx); err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Error creating short url",
			"success": false,
			"error":   err.Error(),
		})
	}
	tx.Commit()
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Short url created successfully",
		"success": true,
		"data":    url,
	})
}
