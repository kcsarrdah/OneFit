// models/base.go
package models

import (
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Base struct {
	ID        uint `gorm:"primarykey"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

// models/base.go
func SetupDB() *gorm.DB {
	dsn := "host=localhost user=onefit password=onefit123 dbname=onefit port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect database")
	}
	return db
}
