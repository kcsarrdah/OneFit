package models

type Exercise struct {
	Base
	Name            string `json:"name" gorm:"not null;index:idx_exercises_user_name,priority:2"`
	MuscleGroups    string `json:"muscle_groups" gorm:"type:text"`
	Equipment       string `json:"equipment"`
	Instructions    string `json:"instructions" gorm:"type:text"`
	IsCustom        bool   `json:"is_custom" gorm:"default:false"`
	CreatedByUserID *uint  `json:"created_by_user_id" gorm:"index;index:idx_exercises_user_name,priority:1"`
	User            *User  `json:"-" gorm:"foreignKey:CreatedByUserID"`
}

func (Exercise) TableName() string {
	return "exercises"
}
