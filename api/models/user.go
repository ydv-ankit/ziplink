package models

import (
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Id       string
	Name     string
	Email    string
	Password string
}

func (User) TableName() string {
	return "users"
}

func (user *User) CreateUser(tx *gorm.DB) error {
	if user.Id == "" {
		user.Id = uuid.New().String()
	}
	if user.Name == "" {
		return errors.New("name is required")
	}
	if user.Email == "" {
		return errors.New("email is required")
	}
	if user.Password == "" {
		return errors.New("password is required")
	}
	return tx.Create(user).Error
}

func (user *User) GetUserById(tx *gorm.DB) error {
	if user.Id == "" {
		return errors.New("id is required")
	}
	return tx.Where("id = ?", user.Id).First(user).Error
}

func (user *User) GetUserByEmail(tx *gorm.DB) error {
	if user.Email == "" {
		return errors.New("email is required")
	}
	return tx.Where("email = ?", user.Email).First(user).Error
}
