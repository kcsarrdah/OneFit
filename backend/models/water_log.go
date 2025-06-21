package models

import "time"

// WaterLog represents a water intake entry
type WaterLog struct {
	Base
	UserID   uint      `json:"user_id" gorm:"not null;index" validate:"required"`
	Amount   float64   `json:"amount" gorm:"not null" validate:"required,min=0"`
	LoggedAt time.Time `json:"logged_at" gorm:"not null" validate:"required"`
	User     User      `json:"-" gorm:"foreignKey:UserID"`
}

func (WaterLog) TableName() string {
	return "water_logs"
}
