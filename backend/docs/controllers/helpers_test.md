# `controllers/helpers_test.go`

## Purpose

Shared helpers for controller tests: a Gin router without Firebase and JSON request shortcuts.

## Public API

Unexported, test-only:

```go
func newTestRouter(db *gorm.DB, user *models.User) *gin.Engine
func do(t *testing.T, r *gin.Engine, method, path string, body any) (int, map[string]any)
func mustDo(t *testing.T, r *gin.Engine, method, path string, body any, want int) map[string]any
func idOf(t *testing.T, out map[string]any, key string) uint
```

## How it works

`newTestRouter` sets `userId` and `user` in the context (what [middleware/auth.go](../middleware/auth.md) does after verifying a token) and registers the exercise, template and workout handlers the tests need, at their real paths. `do` encodes the body as JSON and decodes the JSON response; `mustDo` also fails unless the status matches; `idOf` reads `ID` from a created object in the response.

## Depends on

[exercise_controller.go](exercise_controller.md), [template_controller.go](template_controller.md), [workout_controller.go](workout_controller.md), `gin`, `httptest`.

## Used by

[errors_test.go](errors_test.md) and the other controller tests.

## Tests

none (helpers).

## Gotchas / TODO

Register a handler here before testing it; routes not listed return Gin's 404 page, which `do` cannot decode.
