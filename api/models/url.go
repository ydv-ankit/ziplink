package models

import "gorm.io/gorm"

type Url struct {
	gorm.Model
	Id     string
	UserId string
	Long   string
	Short  string
	Expiry int
}
