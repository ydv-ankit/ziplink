package models

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Url struct {
	gorm.Model
	Id     string
	UserId string
	Long   string
	Short  string
	Expiry int
}

func (Url) TableName() string {
	return "urls"
}

func (url *Url) CreateUrl(tx *gorm.DB) error {
	if url.Id == "" {
		url.Id = uuid.New().String()
	}
	if url.UserId == "" {
		return errors.New("userId is required")
	}
	if url.Long == "" {
		return errors.New("longUrl is required")
	}
	if url.Short == "" {
		return errors.New("shortUrl is required")
	}
	if url.Expiry == 0 {
		url.Expiry = int(time.Hour * 24 * 30)
	}
	return tx.Create(url).Error
}

func (url *Url) GetUrl(tx *gorm.DB) error {
	if url.Id == "" {
		return errors.New("id is required")
	}
	return tx.Where("id = ?", url.Id).First(url).Error
}

func (url *Url) GetUrlByShort(tx *gorm.DB) error {
	if url.Short == "" {
		return errors.New("shortUrl is required")
	}
	return tx.Where("short = ?", url.Short).First(url).Error
}
