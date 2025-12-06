package main

import (
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/monitor"
	"github.com/ydv-ankit/go-url-shortener/config"
	"github.com/ydv-ankit/go-url-shortener/routes"
	"github.com/ydv-ankit/go-url-shortener/utils"
)

func authMiddleware(c *fiber.Ctx) error {
	token := c.Cookies("token")
	if token == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Unauthorized",
			"success": false,
			"error":   "Unauthorized",
		})
	}
	userId, err := utils.VerifyToken(token)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Unauthorized",
			"success": false,
			"error":   "Unauthorized",
		})
	}
	c.Locals("userId", userId)
	return c.Next()
}

func setupRoutes(app *fiber.App) {
	app.Use(cors.New(cors.Config{
		AllowOrigins:     os.Getenv("APP_URL"),
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
		AllowCredentials: true,
	}))
	// metrics route
	app.Get("/metrics", monitor.New())

	// user routes
	app.Post("/api/v1/create-user", routes.CreateUser)
	app.Post("/api/v1/login", routes.LoginUser)
	app.Post("/api/v1/logout", routes.LogoutUser)

	// url routes
	app.Get("/:short", routes.ResolveUrl)
	// auth middleware
	app.Use(authMiddleware)
	// get all urls by user id route
	app.Get("/api/v1/urls", routes.GetAllUrlsByUserId)
	// shorten url route
	app.Post("/api/v1/shorten", routes.ShortenUrl)
	// delete url route
	app.Delete("/api/v1/delete", routes.DeleteUrl)
}

func main() {
	app := fiber.New()

	// parse env file
	utils.EnvParser()

	// connect to db
	config.CreateMySQLClient()

	// setup routes
	setupRoutes(app)

	// start server
	err := app.Listen(os.Getenv("APP_PORT"))
	if err != nil {
		panic("Failed to start server")
	}

}
