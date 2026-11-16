# `models/workout_session.go`

## Purpose

A performed workout and what was done in it: `workout_sessions` → `session_exercises` → `exercise_sets`.

## Public API

```go
type WorkoutSession struct {
    Base
    UserID          uint              `json:"user_id"`
    TemplateID      *uint             `json:"template_id"`         // nil for freestyle
    Name            string            `json:"name"`
    StartedAt       time.Time         `json:"started_at"`
    EndedAt         *time.Time        `json:"ended_at"`            // nil = active
    DurationMinutes *int              `json:"duration_minutes"`
    Notes           string            `json:"notes"`
    User            User              `json:"-"`
    Template        *WorkoutTemplate  `json:"template,omitempty"`
    Exercises       []SessionExercise `json:"exercises"`           // OnDelete:CASCADE
}

type SessionExercise struct {
    Base
    SessionID   uint           `json:"session_id"`
    ExerciseID  uint           `json:"exercise_id"`
    OrderIndex  int            `json:"order_index"`
    Notes       string         `json:"notes"`
    CompletedAt *time.Time     `json:"completed_at"`
    Session     WorkoutSession `json:"-"`
    Exercise    Exercise       `json:"exercise"`
    Sets        []ExerciseSet  `json:"sets"`                       // OnDelete:CASCADE
}

type ExerciseSet struct {
    Base
    SessionExerciseID uint      `json:"session_exercise_id"`
    SetNumber         int       `json:"set_number"`
    Reps              *int      `json:"reps"`
    Weight            *float64  `json:"weight"`           // kg
    DurationSeconds   *int      `json:"duration_seconds"`
    DistanceMeters    *float64  `json:"distance_meters"`
    RPE               *int      `json:"rpe"`              // 1-10, not enforced
    CompletedAt       time.Time `json:"completed_at"`
    SessionExercise   SessionExercise `json:"-"`
}
// TableName: "workout_sessions", "session_exercises", "exercise_sets"
```

## How it works

A session is "active" while `ended_at` is null. Set metrics are pointers so "not recorded" (null) differs from 0.

## Depends on

[base.go](base.md), [user.go](user.md), [exercise.go](exercise.md), [workout_template.go](workout_template.md).

## Used by

[services/workout_service.go](../services/workout_service.md), [services/exercise_service.go](../services/exercise_service.md) (in-use check), [services/template_service.go](../services/template_service.md) (in-use check), [setup.go](setup.md).

## Tests

none

## Gotchas / TODO

- **Bug (verified):** `constraint:OnDelete:CASCADE` has no effect because deletes are soft. Deleting a session leaves its `session_exercises` and `exercise_sets` rows live, and those sets are still counted by `GetWorkoutStats`.
- `Exercise` is a value, not a pointer: when not preloaded it serialises as a zero-valued exercise object rather than being omitted.
