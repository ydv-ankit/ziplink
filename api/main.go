package main

import (
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/ydv-ankit/go-url-shortener/helpers"
)

func main() {
	app := fiber.New()

	// parse env file
	helpers.EnvParser()

	// start server
	err := app.Listen(os.Getenv("APP_PORT"))
	if err != nil {
		panic("Failed to start server")
	}
}
