package models

type Exercise struct {
	Base
	Name            string `json:"name" gorm:"uniqueIndex;not null"`
	MuscleGroups    string `json:"muscle_groups" gorm:"type:jsonb"`
	Equipment       string `json:"equipment"`
	Instructions    string `json:"instructions" gorm:"type:text"`
	IsCustom        bool   `json:"is_custom" gorm:"default:false"`
	CreatedByUserID *uint  `json:"created_by_user_id" gorm:"index"`
	User            *User  `json:"-" gorm:"foreignKey:CreatedByUserID"`
}

func (Exercise) TableName() string {
	return "exercises"
}
