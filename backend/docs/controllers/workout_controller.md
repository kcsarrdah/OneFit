# `controllers/workout_controller.go`

## Purpose

HTTP handlers for the workout lifecycle: history, start, active, stats, update/finish, delete, exercises in a session, and set logging.

## Public API

```go
type WorkoutController struct { /* db, workoutService */ }
func NewWorkoutController(db *gorm.DB) *WorkoutController
func (wc *WorkoutController) GetWorkouts(c *gin.Context)
func (wc *WorkoutController) GetWorkout(c *gin.Context)
func (wc *WorkoutController) StartWorkout(c *gin.Context)
func (wc *WorkoutController) UpdateWorkout(c *gin.Context)
func (wc *WorkoutController) DeleteWorkout(c *gin.Context)
func (wc *WorkoutController) AddExerciseToWorkout(c *gin.Context)
func (wc *WorkoutController) UpdateSessionExercise(c *gin.Context)
func (wc *WorkoutController) RemoveExerciseFromWorkout(c *gin.Context)
func (wc *WorkoutController) LogSet(c *gin.Context)
func (wc *WorkoutController) UpdateSet(c *gin.Context)
func (wc *WorkoutController) DeleteSet(c *gin.Context)
func (wc *WorkoutController) GetActiveWorkout(c *gin.Context)
func (wc *WorkoutController) GetWorkoutStats(c *gin.Context)
```

All routes: Auth Firebase. `:exercise_id` = **SessionExercise** ID (`workout.exercises[].ID`).

| Method | Path | Request | Response |
|---|---|---|---|
| `GET` | `/api/workouts/` | query `limit`? (20), `offset`? (0), `start_date`?, `end_date`? | `200 {"workouts": [WorkoutSession], "total", "limit", "offset"}` |
| `POST` | `/api/workouts/` | `{"name": string (required), "template_id"?: uint, "notes"?}` | `201 {"message": "Workout started successfully", "workout"}` |
| `GET` | `/api/workouts/active` | none | `200 {"workout": WorkoutSession}` or `200 {"workout": null, "message": "No active workout"}` |
| `GET` | `/api/workouts/stats` | query `days`? (30) | `200 {"stats": {total_workouts, total_minutes, total_sets, average_duration_minutes, period_days}}` |
| `GET` | `/api/workouts/:id` | none | `200 {"workout": WorkoutSession}` |
| `PUT` | `/api/workouts/:id` | `{"name"?, "notes"?, "ended_at"?: RFC3339, "is_active"?: bool}` | `200 {"message": "Workout updated successfully", "workout"}` |
| `DELETE` | `/api/workouts/:id` | none | `200 {"message": "Workout deleted successfully"}` |
| `POST` | `/api/workouts/:id/exercises` | `{"exercise_id": uint (required), "order_index"?, "notes"?}` | `201 {"message": "Exercise added to workout successfully", "session_exercise"}` |
| `PUT` | `/api/workouts/:id/exercises/:exercise_id` | `{"order_index"?, "notes"?, "completed_at"?: RFC3339}` | `200 {"message": "Session exercise updated successfully", "session_exercise"}` |
| `DELETE` | `/api/workouts/:id/exercises/:exercise_id` | none | `200 {"message": "Exercise removed from workout successfully"}` |
| `POST` | `/api/workouts/:id/exercises/:exercise_id/sets` | `{"reps"?, "weight"?, "duration_seconds"?, "distance_meters"?, "rpe"?}` (≥1 of the first four) | `201 {"message": "Set logged successfully", "set": ExerciseSet}` |
| `PUT` | `/api/workouts/:id/sets/:set_id` | same fields, optional | `200 {"message": "Set updated successfully", "set"}` |
| `DELETE` | `/api/workouts/:id/sets/:set_id` | none | `200 {"message": "Set deleted successfully"}` |

Errors: 400 `Invalid workout ID` / `Invalid session exercise ID` / `Invalid set ID` / binding; 404 `Workout not found` / `Workout not found or not owned by user` / `Workout or exercise not found` / `Session exercise not found` / `Set not found`; 500 `Failed to ...`. Full detail: [API.md#workouts-apiworkouts](../API.md#workouts-apiworkouts).

## How it works

Parse ids, read the user from context, call `WorkoutService`, map `gorm.ErrRecordNotFound` → 404, other errors → 500. `limit`/`offset` use `strconv.Atoi` with errors ignored (bad value → 0). `days` falls back to 30 when invalid or ≤ 0.

## Depends on

[services/workout_service.go](../services/workout_service.md), [models/workout_session.go](../models/workout_session.md), `gin`, `gorm`.

## Used by

[routes/workout_routes.go](../routes/workout_routes.md).

## Tests

none

## Gotchas / TODO

- `?limit=abc` → 0 → empty page (GORM emits `LIMIT 0`); `?limit=-1` → no limit.
- Starting from an inaccessible template, or logging a set with no metric, returns 500 instead of 404/400.
- `PUT /:id` responds without exercises (`"exercises": null`); refetch with `GET /:id` for the full workout.
- `start_date` / `end_date` are not validated.
