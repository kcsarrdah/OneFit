# `services/errors.go`

## Purpose

Error kinds that let controllers tell a client mistake from a server failure, so validation and conflict errors become 400/404/409 instead of 500.

## Public API

```go
var ErrInvalidInput = errors.New("invalid input") // → 400
var ErrNotFound     = errors.New("not found")     // → 404
var ErrConflict     = errors.New("conflict")      // → 409
```

Unexported: `newError(kind error, format string, args ...any) error`.

## How it works

`newError` returns a `serviceError` whose `Error()` is only the formatted message (no `"conflict: "` prefix) and whose `Unwrap()` is the kind, so `errors.Is(err, ErrConflict)` works and the message can go straight to the client. Missing rows are still reported as `gorm.ErrRecordNotFound`, not `ErrNotFound`; `ErrNotFound` is for "found but not yours" cases the service decides itself (an inaccessible template).

## Depends on

Standard `errors`, `fmt`.

## Used by

[exercise_service.go](exercise_service.md), [template_service.go](template_service.md), [workout_service.go](workout_service.md); checked by [controllers/errors.go](../controllers/errors.md).

## Tests

Through [controllers/errors_test.go](../controllers/errors_test.md).

## Gotchas / TODO

[anatomy_service.go](anatomy_service.md) has its own `ErrMuscleNotFound` and does not use these kinds.
