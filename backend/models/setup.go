package models

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func SetupDB() *gorm.DB {
	// Use SQLite for development
	db, err := gorm.Open(sqlite.Open("onefit.db"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect database")
	}

	// Auto create tables
	db.AutoMigrate(&User{}, &Workout{}, &Meal{}, &FastSession{})

	return db
}
