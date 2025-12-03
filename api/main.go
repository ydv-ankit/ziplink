package main

import (
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/ydv-ankit/go-url-shortener/config"
	"github.com/ydv-ankit/go-url-shortener/utils"
)

func main() {
	app := fiber.New()

	// parse env file
	utils.EnvParser()

	// start server
	config.CreateMySQLClient()
	err := app.Listen(os.Getenv("APP_PORT"))
	if err != nil {
		panic("Failed to start server")
	}

}
