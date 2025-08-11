package models

type User struct {
	Base
	FirebaseUID string `gorm:"uniqueIndex;not null"` // NEW: Firebase UID
	Email       string `gorm:"uniqueIndex;not null"`
	// Remove Password - Firebase handles authentication
	Name     string
	Height   float64
	Weight   float64
	Goals    string `gorm:"type:text"`
	Settings string `gorm:"type:text"`
}
