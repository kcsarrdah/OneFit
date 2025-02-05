package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FastingStatus string

const (
	FastingStatusOngoing   FastingStatus = "ONGOING"
	FastingStatusCompleted FastingStatus = "COMPLETED"
	FastingStatusCancelled FastingStatus = "CANCELLED"
)

// FastingSession represents a single fasting session
type FastingSession struct {
	ID          uuid.UUID     `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID     `gorm:"type:uuid;not null" json:"user_id"`
	StartTime   time.Time     `gorm:"not null" json:"start_time"`
	EndTime     *time.Time    `json:"end_time,omitempty"`
	TargetHours int           `gorm:"not null" json:"target_hours"`
	FastTypeID  uuid.UUID     `gorm:"type:uuid;not null" json:"fast_type_id"`
	FastType    FastType      `gorm:"foreignKey:FastTypeID" json:"fast_type"`
	Notes       string        `gorm:"type:text" json:"notes,omitempty"`
	Status      FastingStatus `gorm:"type:varchar(20);not null" json:"status"`
	CreatedAt   time.Time     `gorm:"not null" json:"created_at"`
	UpdatedAt   time.Time     `gorm:"not null" json:"updated_at"`
}

// FastType represents different types of fasting protocols
type FastType struct {
	ID          uuid.UUID  `gorm:"primarykey;type:text"`
	Name        string     `gorm:"type:varchar(50);not null"`
	Description string     `gorm:"type:text"`
	TargetHours int        `gorm:"not null"`
	IsCustom    bool       `gorm:"default:false"`
	UserID      *uuid.UUID `gorm:"type:text"`
	CreatedAt   time.Time  `gorm:"not null"`
}

// BeforeCreate will set timestamps before creating record
func (f *FastingSession) a(tx *gorm.DB) error {
	now := time.Now()
	f.CreatedAt = now
	f.UpdatedAt = now
	return nil
}

// BeforeUpdate will set updated_at timestamp before updating record
func (f *FastingSession) BeforeUpdate(tx *gorm.DB) error {
	f.UpdatedAt = time.Now()
	return nil
}

// BeforeCreate for FastType to set creation timestamp
func (ft *FastType) BeforeCreate(tx *gorm.DB) error {
    ft.ID = uuid.New()
    ft.CreatedAt = time.Now()
    return nil
}

// InitializeDefaultFastTypes sets up the default fasting protocols
func InitializeDefaultFastTypes(db *gorm.DB) error {
	defaultTypes := []FastType{
		{
			Name:        "16:8 Intermittent Fast",
			Description: "16 hours of fasting followed by 8-hour eating window",
			TargetHours: 16,
			IsCustom:    false,
		},
		{
			Name:        "18:6 Intermittent Fast",
			Description: "18 hours of fasting followed by 6-hour eating window",
			TargetHours: 18,
			IsCustom:    false,
		},
		{
			Name:        "20:4 Intermittent Fast",
			Description: "20 hours of fasting followed by 4-hour eating window",
			TargetHours: 20,
			IsCustom:    false,
		},
		{
			Name:        "24-Hour Fast",
			Description: "Full day fast from dinner to dinner",
			TargetHours: 24,
			IsCustom:    false,
		},
	}

	for _, fastType := range defaultTypes {
		// Only create if doesn't exist
		result := db.Where("name = ? AND is_custom = false", fastType.Name).First(&FastType{})
		if result.RowsAffected == 0 {
			if err := db.Create(&fastType).Error; err != nil {
				return err
			}
		}
	}

	return nil
}
