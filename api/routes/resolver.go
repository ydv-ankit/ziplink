package routes

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/ydv-ankit/go-url-shortener/config"
	"github.com/ydv-ankit/go-url-shortener/models"
)

func ResolveUrl(c *fiber.Ctx) error {
	short := c.Params("short")
	url := new(models.Url)
	url.Short = short
	tx := config.GetMySQLClient().Begin()
	if err := url.GetUrlByShort(tx); err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": "Url not found",
			"success": false,
			"error":   "Url not found",
		})
	}
	// check if url is expired
	if time.Now().After(url.Expiry) {
		tx.Rollback()
		return c.Status(fiber.StatusGone).JSON(fiber.Map{
			"message": "Url expired",
			"success": false,
			"error":   "Url expired",
		})
	}
	tx.Commit()
	return c.Redirect(url.Long, fiber.StatusTemporaryRedirect)
}
