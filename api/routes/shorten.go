package routes

import (
	"errors"
	"fmt"
	"math/rand"
	"regexp"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/ydv-ankit/go-url-shortener/config"
	"github.com/ydv-ankit/go-url-shortener/models"
	"gorm.io/gorm"
)

const (
	SHORT_URL_RETRY_LIMIT = 10
	SHORT_URL_LENGTH      = 7
	MIN_CUSTOM_LENGTH     = 3
	MAX_CUSTOM_LENGTH     = 20
)

// Reserved words that cannot be used as custom short codes
var reservedWords = []string{
	"admin", "api", "www", "mail", "ftp", "localhost", "about", "contact",
	"help", "support", "login", "logout", "register", "signup", "signin",
	"dashboard", "settings", "profile", "account", "delete", "edit", "create",
	"update", "new", "old", "test", "demo", "example", "shorten", "url",
	"link", "stats", "analytics", "report", "export", "import", "search",
	"filter", "sort", "page", "next", "prev", "first", "last", "home",
}

// validateCustomShort validates a custom short code
func validateCustomShort(customShort string) error {
	if customShort == "" {
		return nil // Empty is allowed, will generate random
	}

	// Check length
	if len(customShort) < MIN_CUSTOM_LENGTH {
		return fmt.Errorf("custom short code must be at least %d characters", MIN_CUSTOM_LENGTH)
	}
	if len(customShort) > MAX_CUSTOM_LENGTH {
		return fmt.Errorf("custom short code must be at most %d characters", MAX_CUSTOM_LENGTH)
	}

	// Check if alphanumeric only
	matched, err := regexp.MatchString("^[a-zA-Z0-9]+$", customShort)
	if err != nil {
		return errors.New("error validating custom short code")
	}
	if !matched {
		return errors.New("custom short code must contain only alphanumeric characters (a-z, A-Z, 0-9)")
	}

	// Check if reserved word
	customShortLower := strings.ToLower(customShort)
	for _, reserved := range reservedWords {
		if customShortLower == reserved {
			return fmt.Errorf("'%s' is a reserved word and cannot be used", customShort)
		}
	}

	return nil
}

// checkShortAvailability checks if a short code is available
func checkShortAvailability(tx *gorm.DB, short string) (bool, error) {
	url := &models.Url{Short: short}
	err := url.GetUrlByShort(tx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return true, nil // Available
		}
		return false, err // Error checking
	}
	return false, nil // Not available
}

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

type ShortenUrlRequest struct {
	Long        string    `json:"long"`
	CustomShort string    `json:"customShort,omitempty"`
	Expiry      time.Time `json:"expiry,omitempty"`
}

func ShortenUrl(c *fiber.Ctx) error {
	req := new(ShortenUrlRequest)
	err := c.BodyParser(req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
			"success": false,
			"error":   err.Error(),
		})
	}

	// Validate custom short code if provided
	if req.CustomShort != "" {
		if err := validateCustomShort(req.CustomShort); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": "Invalid custom short code",
				"success": false,
				"error":   err.Error(),
			})
		}
	}

	userId := c.Locals("userId").(string)
	tx := config.GetMySQLClient().Begin()

	var shortUrl string
	if req.CustomShort != "" {
		// Check availability of custom short code
		available, err := checkShortAvailability(tx, req.CustomShort)
		if err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Error checking short code availability",
				"success": false,
				"error":   err.Error(),
			})
		}
		if !available {
			tx.Rollback()
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"message": "Custom short code is already taken",
				"success": false,
				"error":   "The custom short code you requested is already in use",
			})
		}
		shortUrl = req.CustomShort
	} else {
		// Generate random short URL
		shortUrl, err = generateShortUrl(tx, 0)
		if err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Failed to generate short url",
				"success": false,
				"error":   err.Error(),
			})
		}
	}

	url := &models.Url{
		UserId: userId,
		Long:   req.Long,
		Short:  shortUrl,
		Expiry: req.Expiry,
	}

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
