# `models/workout_template.go`

## Purpose

Reusable workout plans: `workout_templates` and their ordered `template_exercises` with targets.

## Public API

```go
type WorkoutTemplate struct {
    Base
    UserID      uint               `json:"user_id"`
    Name        string             `json:"name"`        // unique per user (service check, not DB)
    Description string             `json:"description"`
    Category    string             `json:"category"`
    IsPublic    bool               `json:"is_public"`   // visible to all users
    User        User               `json:"-"`
    Exercises   []TemplateExercise `json:"exercises"`   // OnDelete:CASCADE
}

type TemplateExercise struct {
    Base
    TemplateID   uint            `json:"template_id"`
    ExerciseID   uint            `json:"exercise_id"`
    OrderIndex   int             `json:"order_index"`
    TargetSets   int             `json:"target_sets"`
    TargetReps   string          `json:"target_reps"`   // "8-12", "AMRAP", "60 sec"
    TargetWeight *float64        `json:"target_weight"` // kg
    RestSeconds  int             `json:"rest_seconds"`
    Template     WorkoutTemplate `json:"-"`
    Exercise     Exercise        `json:"exercise"`
}
// TableName: "workout_templates", "template_exercises"
```

## How it works

Managed by [template_service.go](../services/template_service.md). Starting a workout from a template copies `template_exercises` into `session_exercises`.

## Depends on

[base.go](base.md), [user.go](user.md), [exercise.go](exercise.md).

## Used by

[services/template_service.go](../services/template_service.md), [services/workout_service.go](../services/workout_service.md), [workout_session.go](workout_session.md), [setup.go](setup.md).

## Tests

none

## Gotchas / TODO

- `OnDelete:CASCADE` never fires (soft delete); deleted templates leave their `template_exercises` rows.
- `gorm:"default:false"` on `IsPublic`: GORM skips zero values that have a default on create, which is fine because the default is false.
