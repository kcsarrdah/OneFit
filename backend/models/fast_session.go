package models

import "time"

// FastSession represents a completed fasting session
type FastSession struct {
	Base
	UserID    uint      `json:"user_id" gorm:"not null;index" validate:"required"`
	StartTime time.Time `json:"start_time" gorm:"not null" validate:"required"`
	EndTime   time.Time `json:"end_time" gorm:"not null" validate:"required"`
	Duration  int       `json:"duration" gorm:"not null" validate:"min=1"`
	Target    int       `json:"target" gorm:"not null" validate:"min=1"`
	Type      string    `json:"type" gorm:"size:20;not null" validate:"required"`
	Notes     string    `json:"notes" gorm:"type:text"`
	User      User      `json:"-" gorm:"foreignKey:UserID"`
}

// TableName specifies the table name for GORM
func (FastSession) TableName() string {
	return "fast_sessions"
}
