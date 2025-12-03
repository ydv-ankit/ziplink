package config

import (
	"os"

	"github.com/ydv-ankit/go-url-shortener/utils"
	"gorm.io/driver/mysql"

	"gorm.io/gorm"
)

func CreateMySQLClient() *gorm.DB {
	dsn := os.Getenv("MYSQL_USER") + ":" + os.Getenv("MYSQL_PASS") + "@/"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err)
	}
	utils.Log("MYSQL client connected")

	return db
}
