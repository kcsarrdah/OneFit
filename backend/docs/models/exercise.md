# `models/exercise.go`

## Purpose

The exercise library row (`exercises` table): built-in exercises and users' custom ones.

## Public API

```go
type Exercise struct {
    Base
    Name            string `json:"name" gorm:"uniqueIndex;not null"`
    MuscleGroups    string `json:"muscle_groups" gorm:"type:text"` // comma-separated, e.g. "chest,shoulders"
    Equipment       string `json:"equipment"`
    Instructions    string `json:"instructions" gorm:"type:text"`
    IsCustom        bool   `json:"is_custom" gorm:"default:false"`
    CreatedByUserID *uint  `json:"created_by_user_id" gorm:"index"` // nil for built-ins
    User            *User  `json:"-" gorm:"foreignKey:CreatedByUserID"`
}
func (Exercise) TableName() string // "exercises"
```

## How it works

Plain GORM model. Built-ins have `is_custom = false`, `created_by_user_id = NULL`; custom exercises are created by [exercise_service.go](../services/exercise_service.md).

## Depends on

[base.go](base.md), [user.go](user.md).

## Used by

[services/exercise_service.go](../services/exercise_service.md), [workout_template.go](workout_template.md), [workout_session.go](workout_session.md), [setup.go](setup.md).

## Tests

none

## Gotchas / TODO

- **Bug:** `Name` is unique across the whole table, not per user. A user cannot create a custom exercise whose name matches a built-in, another user's custom exercise, or any soft-deleted exercise (verified: `UNIQUE constraint failed: exercises.name`, surfaced as a 500).
- `gorm:"default:false"` on a bool means GORM will not write an explicit `false` on create; harmless here because false is the default.
- Nothing seeds built-ins at startup (`SeedDefaultExercises` is never called), so a fresh DB has an empty library.
