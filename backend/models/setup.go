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

	// Auto create tables - add all the new workout models
	db.AutoMigrate(
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

	return db
}
