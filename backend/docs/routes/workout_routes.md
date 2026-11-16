# `routes/workout_routes.go`

## Purpose

Registers the `/api/workouts` group: workout lifecycle, exercises within a workout, and sets.

## Public API

```go
func SetupWorkoutRoutes(router *gin.Engine, db *gorm.DB)
```

| Method | Path | Auth | Handler |
|---|---|---|---|
| `GET` | `/api/workouts/` | `AuthMiddleware` | `GetWorkouts` |
| `POST` | `/api/workouts/` | `AuthMiddleware` | `StartWorkout` |
| `GET` | `/api/workouts/active` | `AuthMiddleware` | `GetActiveWorkout` |
| `GET` | `/api/workouts/stats` | `AuthMiddleware` | `GetWorkoutStats` |
| `GET` | `/api/workouts/:id` | `AuthMiddleware` | `GetWorkout` |
| `PUT` | `/api/workouts/:id` | `AuthMiddleware` | `UpdateWorkout` |
| `DELETE` | `/api/workouts/:id` | `AuthMiddleware` | `DeleteWorkout` |
| `POST` | `/api/workouts/:id/exercises` | `AuthMiddleware` | `AddExerciseToWorkout` |
| `PUT` | `/api/workouts/:id/exercises/:exercise_id` | `AuthMiddleware` | `UpdateSessionExercise` |
| `DELETE` | `/api/workouts/:id/exercises/:exercise_id` | `AuthMiddleware` | `RemoveExerciseFromWorkout` |
| `POST` | `/api/workouts/:id/exercises/:exercise_id/sets` | `AuthMiddleware` | `LogSet` |
| `PUT` | `/api/workouts/:id/sets/:set_id` | `AuthMiddleware` | `UpdateSet` |
| `DELETE` | `/api/workouts/:id/sets/:set_id` | `AuthMiddleware` | `DeleteSet` |

All handlers are on `WorkoutController`. `:exercise_id` is the SessionExercise ID. Shapes: [controllers/workout_controller.md](../controllers/workout_controller.md), [API.md#workouts-apiworkouts](../API.md#workouts-apiworkouts).

## How it works

Group-level `AuthMiddleware`. The static `/active` and `/stats` segments take priority over `/:id` in Gin's router.

## Depends on

[controllers/workout_controller.go](../controllers/workout_controller.md), [middleware/auth.go](../middleware/auth.md).

## Used by

[main.go](../main.md).

## Tests

none

## Gotchas / TODO

none
