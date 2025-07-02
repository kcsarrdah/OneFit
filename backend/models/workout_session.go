package models

import "time"

type WorkoutSession struct {
	Base
	UserID          uint              `json:"user_id" gorm:"not null;index"`
	TemplateID      *uint             `json:"template_id" gorm:"index"`
	Name            string            `json:"name" gorm:"not null"`
	StartedAt       time.Time         `json:"started_at" gorm:"not null"`
	EndedAt         *time.Time        `json:"ended_at"`
	DurationMinutes *int              `json:"duration_minutes"`
	Notes           string            `json:"notes" gorm:"type:text"`
	User            User              `json:"-" gorm:"foreignKey:UserID"`
	Template        *WorkoutTemplate  `json:"template,omitempty" gorm:"foreignKey:TemplateID"`
	Exercises       []SessionExercise `json:"exercises" gorm:"foreignKey:SessionID;constraint:OnDelete:CASCADE"`
}

type SessionExercise struct {
	Base
	SessionID   uint           `json:"session_id" gorm:"not null;index"`
	ExerciseID  uint           `json:"exercise_id" gorm:"not null;index"`
	OrderIndex  int            `json:"order_index" gorm:"not null"`
	Notes       string         `json:"notes" gorm:"type:text"`
	CompletedAt *time.Time     `json:"completed_at"`
	Session     WorkoutSession `json:"-" gorm:"foreignKey:SessionID"`
	Exercise    Exercise       `json:"exercise" gorm:"foreignKey:ExerciseID"`
	Sets        []ExerciseSet  `json:"sets" gorm:"foreignKey:SessionExerciseID;constraint:OnDelete:CASCADE"`
}

type ExerciseSet struct {
	Base
	SessionExerciseID uint            `json:"session_exercise_id" gorm:"not null;index"`
	SetNumber         int             `json:"set_number" gorm:"not null"`
	Reps              *int            `json:"reps"`
	Weight            *float64        `json:"weight"`           // in kg
	DurationSeconds   *int            `json:"duration_seconds"` // for time-based exercises
	DistanceMeters    *float64        `json:"distance_meters"`  // for cardio
	RPE               *int            `json:"rpe"`              // Rate of Perceived Exertion (1-10)
	CompletedAt       time.Time       `json:"completed_at" gorm:"not null"`
	SessionExercise   SessionExercise `json:"-" gorm:"foreignKey:SessionExerciseID"`
}

func (WorkoutSession) TableName() string {
	return "workout_sessions"
}

func (SessionExercise) TableName() string {
	return "session_exercises"
}

func (ExerciseSet) TableName() string {
	return "exercise_sets"
}
