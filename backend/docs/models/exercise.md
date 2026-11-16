# `models/exercise.go`

## Purpose

The exercise library row (`exercises` table): built-in exercises and users' custom ones.

## Public API

```go
type Exercise struct {
    Base
    Name            string `json:"name" gorm:"not null;index:idx_exercises_user_name,priority:2"`
    MuscleGroups    string `json:"muscle_groups" gorm:"type:text"` // comma-separated, e.g. "chest,shoulders"
    Equipment       string `json:"equipment"`
    Instructions    string `json:"instructions" gorm:"type:text"`
    IsCustom        bool   `json:"is_custom" gorm:"default:false"`
    CreatedByUserID *uint  `json:"created_by_user_id" gorm:"index;index:idx_exercises_user_name,priority:1"` // nil for built-ins
    User            *User  `json:"-" gorm:"foreignKey:CreatedByUserID"`
}
func (Exercise) TableName() string // "exercises"
```

## How it works

Plain GORM model. Built-ins have `is_custom = false`, `created_by_user_id = NULL`; custom exercises are created by [exercise_service.go](../services/exercise_service.md).

Names are unique per user, not per table: the service rejects a name the user already has (409), while built-ins and other users' exercises may share it. `idx_exercises_user_name` (`created_by_user_id, name`) is a plain index for that lookup, not a unique constraint, so soft-deleted rows do not block reusing a name. Older databases had a global unique index `idx_exercises_name`; [setup.go](setup.md) drops it.

## Depends on

[base.go](base.md), [user.go](user.md).

## Used by

[services/exercise_service.go](../services/exercise_service.md), [workout_template.go](workout_template.md), [workout_session.go](workout_session.md), [setup.go](setup.md).

## Tests

[services/exercise_service_test.go](../services/exercise_service_test.md) (per-user names), [setup_test.go](setup_test.md) (old index dropped).

## Gotchas / TODO

- Per-user uniqueness is a check-then-insert in the service, not a DB constraint: two simultaneous creates with the same name can both succeed.
- `gorm:"default:false"` on a bool means GORM will not write an explicit `false` on create; harmless here because false is the default.
- Nothing seeds built-ins at startup (`SeedDefaultExercises` is never called), so a fresh DB has an empty library.
