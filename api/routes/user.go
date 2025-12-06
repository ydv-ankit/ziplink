package routes

import (
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/ydv-ankit/go-url-shortener/config"
	"github.com/ydv-ankit/go-url-shortener/models"
	"github.com/ydv-ankit/go-url-shortener/utils"
	"golang.org/x/crypto/bcrypt"
)

func CreateUser(c *fiber.Ctx) error {
	user := new(models.User)
	err := c.BodyParser(&user)
	if err != nil {
		utils.Log("Error parsing request body: " + err.Error())
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
			"success": false,
			"error":   err.Error(),
		})
	}
	tx := config.GetMySQLClient().Begin()
	// check if user already exists
	if err := user.GetUserByEmail(tx); err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "User already exists",
			"success": false,
			"error":   "User already exists",
		})
	}
	// create new user
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), 10)
	user.Password = string(hashedPassword)
	if err != nil {
		utils.Log("Error hashing password: " + err.Error())
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Error hashing password",
			"success": false,
			"error":   err.Error(),
		})
	}
	if err := user.CreateUser(tx); err != nil {
		utils.Log("Error creating user: " + err.Error())
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Error creating user",
			"success": false,
			"error":   err.Error(),
		})
	}
	// commit transaction
	err = tx.Commit().Error
	if err != nil {
		utils.Log("Error committing transaction: " + err.Error())
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Error committing transaction",
			"success": false,
			"error":   err.Error(),
		})
	}
	// return success response
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "User created successfully",
		"success": true,
		"data":    user,
	})
}

func LoginUser(c *fiber.Ctx) error {
	user := new(models.User)
	err := c.BodyParser(&user)
	if err != nil {
		utils.Log("Error parsing request body: " + err.Error())
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
			"success": false,
			"error":   err.Error(),
		})
	}
	// save password
	password := user.Password
	tx := config.GetMySQLClient().Begin()
	if err := user.GetUserByEmail(tx); err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": "User not found",
			"success": false,
			"error":   "User not found",
		})
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Invalid credentials",
			"success": false,
			"error":   "Invalid credentials",
		})
	}
	// generate token
	token, err := utils.GenerateToken(user.Id)
	if err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Error generating token",
			"success": false,
			"error":   err.Error(),
		})
	}
	tx.Commit()
	tokenCookie := &fiber.Cookie{
		Name:     "token",
		Value:    token,
		Expires:  time.Now().Add(time.Hour * 24),
		HTTPOnly: true,
		Secure:   os.Getenv("APP_ENV") == "production",
		SameSite: "Strict",
	}
	c.Cookie(tokenCookie)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "User logged in successfully",
		"success": true,
		"data": fiber.Map{
			"userId": user.Id,
			"name":   user.Name,
			"email":  user.Email,
		},
	})
}

func LogoutUser(c *fiber.Ctx) error {
	c.ClearCookie("token")
	return c.Redirect("/", fiber.StatusTemporaryRedirect)
}
