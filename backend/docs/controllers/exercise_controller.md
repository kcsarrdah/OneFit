# `controllers/exercise_controller.go`

## Purpose

HTTP handlers for the exercise library and the caller's custom exercises.

## Public API

```go
type ExerciseController struct { /* db, exerciseService */ }
func NewExerciseController(db *gorm.DB) *ExerciseController
func (ec *ExerciseController) GetExercises(c *gin.Context)
func (ec *ExerciseController) GetExercise(c *gin.Context)
func (ec *ExerciseController) CreateExercise(c *gin.Context)
func (ec *ExerciseController) UpdateExercise(c *gin.Context)
func (ec *ExerciseController) DeleteExercise(c *gin.Context)
```

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| `GET` | `/api/exercises/` | Firebase | query `muscle_group`?, `equipment`?, `search`?, `include_custom`? (default `true`) | `200 {"exercises": [Exercise], "count": n}` |
| `GET` | `/api/exercises/:id` | Firebase | path `id` | `200 {"exercise": Exercise}` |
| `POST` | `/api/exercises/` | Firebase | `{"name": string (required), "muscle_groups"?, "equipment"?, "instructions"?}` | `201 {"message": "Exercise created successfully", "exercise": Exercise}` |
| `PUT` | `/api/exercises/:id` | Firebase | `{"name"?, "muscle_groups"?, "equipment"?, "instructions"?}` | `200 {"message": "Exercise updated successfully", "exercise": Exercise}` |
| `DELETE` | `/api/exercises/:id` | Firebase | path `id` | `200 {"message": "Exercise deleted successfully"}` |

Errors: 400 `Invalid exercise ID` / binding / `exercise name is required`; 404 `Exercise not found` / `Exercise not found or not owned by user`; 409 duplicate name / exercise in use (service message); 500 `Failed to fetch|create|update|delete exercise(s)`. Full detail: [API.md#exercises-apiexercises](../API.md#exercises-apiexercises).

## How it works

Parses ids with `strconv.ParseUint(..., 10, 32)`, reads the user from context, delegates to `ExerciseService`, and maps errors through [`respondError`](errors.md): `gorm.ErrRecordNotFound` → 404 with the handler's message, typed service errors → 400/404/409 with the service's message, anything else → 500 `Failed to ...`.

## Depends on

[services/exercise_service.go](../services/exercise_service.md), [models/exercise.go](../models/exercise.md), `gin`, `gorm`.

## Used by

[routes/exercise_routes.go](../routes/exercise_routes.md).

## Tests

[controllers/errors_test.go](errors_test.md) checks the 400/404/409 mappings end to end.

## Gotchas / TODO

- `GET /:id` has no ownership check, so other users' custom exercises are readable.
