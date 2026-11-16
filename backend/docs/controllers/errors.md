# `controllers/errors.go`

## Purpose

One place that turns a service error into an HTTP status and body for the exercise, template and workout handlers.

## Public API

Unexported:

```go
func respondError(c *gin.Context, err error, notFoundMsg, fallbackMsg string)
```

| Error | Status | Body |
|---|---|---|
| `gorm.ErrRecordNotFound` | 404 | `{"error": notFoundMsg}` |
| wraps `services.ErrInvalidInput` | 400 | `{"error": err.Error()}` |
| wraps `services.ErrNotFound` | 404 | `{"error": err.Error()}` |
| wraps `services.ErrConflict` | 409 | `{"error": err.Error()}` |
| anything else | 500 | `{"error": fallbackMsg}` |

## How it works

A `switch` on `errors.Is`. Only typed service errors expose their message; raw database errors stay behind the generic `fallbackMsg`.

## Depends on

[services/errors.go](../services/errors.md), `gin`, `gorm`.

## Used by

[exercise_controller.go](exercise_controller.md), [template_controller.go](template_controller.md), [workout_controller.go](workout_controller.md). The fasting, water, user and anatomy controllers still map errors inline.

## Tests

[errors_test.go](errors_test.md).

## Gotchas / TODO

none
