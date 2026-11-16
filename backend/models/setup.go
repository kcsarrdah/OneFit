package models

import (
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func SetupDB() *gorm.DB {
	// Use SQLite for development
	db, err := gorm.Open(sqlite.Open("onefit.db"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect database")
	}

	if err := Migrate(db); err != nil {
		panic("Failed to migrate database: " + err.Error())
	}

	return db
}

// Migrate creates or updates the tables for every model.
func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&User{},
		&Meal{},
		&FastSession{},
		&WaterLog{},
		&Exercise{},
		&WorkoutTemplate{},
		&TemplateExercise{},
		&WorkoutSession{},
		&SessionExercise{},
		&ExerciseSet{},
	)
}
