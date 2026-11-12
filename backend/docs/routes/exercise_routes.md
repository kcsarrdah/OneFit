# `routes/exercise_routes.go`

## Purpose

Registers the `/api/exercises` group.

## Public API

```go
func SetupExerciseRoutes(router *gin.Engine, db *gorm.DB)
```

| Method | Path | Auth | Handler |
|---|---|---|---|
| `GET` | `/api/exercises/` | `AuthMiddleware` | `ExerciseController.GetExercises` |
| `GET` | `/api/exercises/:id` | `AuthMiddleware` | `ExerciseController.GetExercise` |
| `POST` | `/api/exercises/` | `AuthMiddleware` | `ExerciseController.CreateExercise` |
| `PUT` | `/api/exercises/:id` | `AuthMiddleware` | `ExerciseController.UpdateExercise` |
| `DELETE` | `/api/exercises/:id` | `AuthMiddleware` | `ExerciseController.DeleteExercise` |

Shapes: [controllers/exercise_controller.md](../controllers/exercise_controller.md), [API.md#exercises-apiexercises](../API.md#exercises-apiexercises).

## How it works

Group-level `AuthMiddleware`.

## Depends on

[controllers/exercise_controller.go](../controllers/exercise_controller.md), [middleware/auth.go](../middleware/auth.md).

## Used by

[main.go](../main.md).

## Tests

none

## Gotchas / TODO

- The exercise library is shared reference data but requires auth (unlike anatomy).
