package main

import (
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/ydv-ankit/go-url-shortener/config"
	"github.com/ydv-ankit/go-url-shortener/routes"
	"github.com/ydv-ankit/go-url-shortener/utils"
)

func setupRoutes(app *fiber.App) {
	// user routes
	app.Post("/api/v1/create-user", routes.CreateUser)
	app.Post("/api/v1/login", routes.LoginUser)
}

func main() {
	app := fiber.New()

	// parse env file
	utils.EnvParser()

	// start server
	config.CreateMySQLClient()

	// setup routes
	setupRoutes(app)

	// start server
	err := app.Listen(os.Getenv("APP_PORT"))
	if err != nil {
		panic("Failed to start server")
	}

}
