package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/ydv-ankit/go-url-shortener/config"
	"github.com/ydv-ankit/go-url-shortener/models"
)

type UrlWithClicks struct {
	models.Url
	Clicks int64 `json:"clicks"`
}

func GetAllUrlsByUserId(c *fiber.Ctx) error {
	userId := c.Locals("userId").(string)
	tx := config.GetMySQLClient().Begin()
	urls := []models.Url{}
	if err := tx.Where("user_id = ?", userId).Order("created_at DESC").Find(&urls).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Error getting urls",
			"success": false,
			"error":   err.Error(),
		})
	}

	// Get click counts for each URL
	urlsWithClicks := make([]UrlWithClicks, len(urls))
	for i, url := range urls {
		clickCount, err := models.GetClickCountByUrlId(tx, url.Id)
		if err != nil {
			clickCount = 0 // Default to 0 if error
		}
		urlsWithClicks[i] = UrlWithClicks{
			Url:    url,
			Clicks: clickCount,
		}
	}
	tx.Commit()

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Urls fetched successfully",
		"success": true,
		"data":    urlsWithClicks,
	})
}

func DeleteUrl(c *fiber.Ctx) error {
	url := new(models.Url)
	userId := c.Locals("userId").(string)
	err := c.BodyParser(&url)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
			"success": false,
			"error":   err.Error(),
		})
	}
	url.UserId = userId
	tx := config.GetMySQLClient().Begin()
	if err := url.DeleteUrl(tx); err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Error deleting url",
			"success": false,
			"error":   err.Error(),
		})
	}
	tx.Commit()
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Url deleted successfully",
		"success": true,
	})
}
