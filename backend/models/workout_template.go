package models

type WorkoutTemplate struct {
	Base
	UserID      uint               `json:"user_id" gorm:"not null;index"`
	Name        string             `json:"name" gorm:"not null"`
	Description string             `json:"description" gorm:"type:text"`
	Category    string             `json:"category"`
	IsPublic    bool               `json:"is_public" gorm:"default:false"`
	User        User               `json:"-" gorm:"foreignKey:UserID"`
	Exercises   []TemplateExercise `json:"exercises" gorm:"foreignKey:TemplateID;constraint:OnDelete:CASCADE"`
}

type TemplateExercise struct {
	Base
	TemplateID   uint            `json:"template_id" gorm:"not null;index"`
	ExerciseID   uint            `json:"exercise_id" gorm:"not null;index"`
	OrderIndex   int             `json:"order_index" gorm:"not null"`
	TargetSets   int             `json:"target_sets"`
	TargetReps   string          `json:"target_reps"`   // e.g., "8-12", "AMRAP", "60 sec"
	TargetWeight *float64        `json:"target_weight"` // in kg
	RestSeconds  int             `json:"rest_seconds"`
	Template     WorkoutTemplate `json:"-" gorm:"foreignKey:TemplateID"`
	Exercise     Exercise        `json:"exercise" gorm:"foreignKey:ExerciseID"`
}

func (WorkoutTemplate) TableName() string {
	return "workout_templates"
}

func (TemplateExercise) TableName() string {
	return "template_exercises"
}
