package models

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Url struct {
	gorm.Model
	Id     string    `json:"id"`
	UserId string    `json:"userId"`
	Long   string    `json:"long"`
	Short  string    `json:"short"`
	Expiry time.Time `json:"expiry"`
}

func (Url) TableName() string {
	return "urls"
}

func (url *Url) CreateUrl(tx *gorm.DB) error {
	if url.Id == "" {
		url.Id = uuid.New().String()
	}
	if url.Long == "" {
		return errors.New("longUrl is required")
	}
	if url.Expiry.IsZero() {
		url.Expiry = time.Now().Add(time.Hour * 24 * 30) // 30 days
	}
	return tx.Create(url).Error
}

func (url *Url) GetUrlByShort(tx *gorm.DB) error {
	if url.Short == "" {
		return errors.New("shortUrl is required")
	}
	return tx.Where("short = ?", url.Short).First(url).Error
}

func (url *Url) DeleteUrl(tx *gorm.DB) error {
	if url.Id == "" {
		return errors.New("id is required")
	}
	result := tx.Unscoped().Where("id = ? AND user_id = ?", url.Id, url.UserId).Delete(&Url{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("url not found")
	}
	return nil
}
