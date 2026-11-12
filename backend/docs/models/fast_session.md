# `models/fast_session.go`

## Purpose

A completed fast (`fast_sessions` table). The timer runs on the client; the backend only stores finished fasts.

## Public API

```go
type FastSession struct {
    Base
    UserID    uint      `json:"user_id"`    // not null, indexed
    StartTime time.Time `json:"start_time"`
    EndTime   time.Time `json:"end_time"`
    Duration  int       `json:"duration"`   // actual, minutes
    Target    int       `json:"target"`     // goal, minutes
    Type      string    `json:"type"`       // size 20: "16:8" | "18:6" | "20:4" | "OMAD" | "custom"
    Notes     string    `json:"notes"`
    User      User      `json:"-"`
}
func (FastSession) TableName() string // "fast_sessions"
```

## How it works

Rows are built by [fasting_controller.go](../controllers/fasting_controller.md), which converts seconds to minutes and derives `Type` from the goal hours.

## Depends on

[base.go](base.md), [user.go](user.md).

## Used by

[controllers/fasting_controller.go](../controllers/fasting_controller.md), [setup.go](setup.md), SQL in [queries/user_queries.go](../queries/user_queries.md).

## Tests

none

## Gotchas / TODO

- The `validate:"..."` tags are never evaluated (no validator runs on models); validation lives in the controller.
- No "completed" flag; whether a fast met its target is `duration >= target`.
