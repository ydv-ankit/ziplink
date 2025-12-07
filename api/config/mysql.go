package config

import (
	"os"

	"github.com/ydv-ankit/go-url-shortener/models"
	"github.com/ydv-ankit/go-url-shortener/utils"
	"gorm.io/driver/mysql"

	"gorm.io/gorm"
)

var MySQLClient *gorm.DB

func CreateMySQLClient() {
	dsn := os.Getenv("MYSQL_USER") + ":" + os.Getenv("MYSQL_PASS") + "@tcp(" + os.Getenv("MYSQL_HOST") + ")/" + os.Getenv("MYSQL_DB") + "?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	// auto migrate models
	db.AutoMigrate(&models.User{}, &models.Url{}, &models.UrlClick{})
	utils.Log("MYSQL client connected")

	MySQLClient = db
}

func GetMySQLClient() *gorm.DB {
	if MySQLClient == nil {
		CreateMySQLClient()
	}
	return MySQLClient
}
