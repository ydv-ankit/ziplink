package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/ydv-ankit/go-url-shortener/config"
	"github.com/ydv-ankit/go-url-shortener/models"
)

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
