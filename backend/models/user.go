package models

type User struct {
    Base
    Email     string `gorm:"uniqueIndex;not null"`
    Password  string `gorm:"not null"`
    Name      string
    Height    float64
    Weight    float64
    Goals     string  `gorm:"type:jsonb"`
    Settings  string  `gorm:"type:jsonb"`
}