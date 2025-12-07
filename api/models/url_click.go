package models

import (
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UrlClick struct {
	gorm.Model
	Id        string `json:"id"`
	UrlId     string `json:"urlId" gorm:"index"`
	IpAddress string `json:"ipAddress"`
}

func (UrlClick) TableName() string {
	return "url_clicks"
}

func (click *UrlClick) CreateClick(tx *gorm.DB) error {
	if click.Id == "" {
		click.Id = uuid.New().String()
	}
	if click.UrlId == "" {
		return errors.New("urlId is required")
	}
	return tx.Create(click).Error
}

func GetClickCountByUrlId(tx *gorm.DB, urlId string) (int64, error) {
	var count int64
	err := tx.Model(&UrlClick{}).Where("url_id = ?", urlId).Count(&count).Error
	return count, err
}
