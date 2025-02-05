package models

import "time"

type Meal struct {
	Base
	UserID    uint
	Name      string
	Time      time.Time
	Calories  float64
	Protein   float64
	Carbs     float64
	Fats      float64
	FoodItems string `gorm:"type:jsonb"`
	Notes     string
	User      User `gorm:"foreignKey:UserID"`
}
