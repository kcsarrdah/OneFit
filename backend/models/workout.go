package models

import "time"

type Workout struct {
	Base
	UserID    uint
	Name      string
	StartTime time.Time
	EndTime   time.Time
	Type      string
	Exercises string `gorm:"type:jsonb"`
	Notes     string
	User      User `gorm:"foreignKey:UserID"`
}
