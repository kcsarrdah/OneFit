# `services/workout_service.go`

## Purpose

Workout sessions: history, start (freestyle or from a template), update/finish, delete, exercises within a session, set logging, active workout, stats.

## Public API

```go
type WorkoutService struct { /* db */ }
func NewWorkoutService(db *gorm.DB) *WorkoutService

func (ws *WorkoutService) GetUserWorkouts(userID uint, limit, offset int, startDate, endDate string) ([]models.WorkoutSession, int64, error)
func (ws *WorkoutService) GetWorkoutWithDetails(userID, workoutID uint) (*models.WorkoutSession, error)
func (ws *WorkoutService) StartWorkout(userID uint, name string, templateID *uint, notes string) (*models.WorkoutSession, error)
func (ws *WorkoutService) UpdateWorkout(userID, workoutID uint, name, notes *string, endedAt *time.Time, isActive *bool) (*models.WorkoutSession, error)
func (ws *WorkoutService) DeleteWorkout(userID, workoutID uint) error
func (ws *WorkoutService) AddExerciseToWorkout(userID, workoutID, exerciseID uint, orderIndex int, notes string) (*models.SessionExercise, error)
func (ws *WorkoutService) UpdateSessionExercise(userID, workoutID, sessionExerciseID uint, orderIndex *int, notes *string, completedAt *time.Time) (*models.SessionExercise, error)
func (ws *WorkoutService) RemoveExerciseFromWorkout(userID, workoutID, sessionExerciseID uint) error
func (ws *WorkoutService) LogSet(userID, workoutID, sessionExerciseID uint, reps *int, weight *float64, durationSeconds *int, distanceMeters *float64, rpe *int) (*models.ExerciseSet, error)
func (ws *WorkoutService) UpdateSet(userID, workoutID, setID uint, reps *int, weight *float64, durationSeconds *int, distanceMeters *float64, rpe *int) (*models.ExerciseSet, error)
func (ws *WorkoutService) DeleteSet(userID, workoutID, setID uint) error
func (ws *WorkoutService) GetActiveWorkout(userID uint) (*models.WorkoutSession, error) // (nil, nil) if none
func (ws *WorkoutService) GetWorkoutStats(userID uint, days int) (map[string]interface{}, error)
```

## How it works

- Ownership: every method filters by `user_id`; nested rows are checked by joining up to `workout_sessions` (`session_exercises.session_id = ? AND workout_sessions.user_id = ?`). Not found → `gorm.ErrRecordNotFound`.
- `GetUserWorkouts`: optional `started_at >= "<start> 00:00:00"` / `<= "<end> 23:59:59"` (string comparison against SQLite's stored text), `Count` for `total`, then preload `Template`, `Exercises.Exercise`, `Exercises.Sets` with `started_at DESC`, limit/offset. (Verified: limit and total behave correctly together.)
- `GetWorkoutWithDetails` / `GetActiveWorkout`: preload exercises by `order_index`, sets by `set_number`. Active = `ended_at IS NULL`, first by primary key.
- `StartWorkout`: template must be own or public; creates the session (`StartedAt = now`), copies template exercises (notes `"Target: N sets of R"`); if copying fails it deletes the session and errors. Returns full details.
- `UpdateWorkout`: non-blank name, notes; `endedAt` sets end + `DurationMinutes` (truncated minutes); else `isActive == false` ends now if not ended.
- `AddExerciseToWorkout`: exercise must exist; `orderIndex == 0` → max + 1.
- `LogSet`: requires one of reps/weight/duration/distance; `SetNumber = max + 1`; `CompletedAt = now`.
- `GetWorkoutStats`: window `now - days`. `total_workouts`, `total_minutes` over finished sessions; `total_sets` over sets joined to sessions in the window; `average_duration_minutes = total_minutes / total_workouts`.

## Depends on

[models/workout_session.go](../models/workout_session.md), [models/workout_template.go](../models/workout_template.md), [models/exercise.go](../models/exercise.md), `gorm`.

## Used by

[controllers/workout_controller.go](../controllers/workout_controller.md).

## Tests

none

## Gotchas / TODO

- **Bug (verified):** deletes are soft and do not cascade. After `DeleteWorkout`, the session's exercises and sets stay live, and `GetWorkoutStats.total_sets` still counts them (the join does not filter `workout_sessions.deleted_at`). Same for `RemoveExerciseFromWorkout` (sets remain).
- `total_sets` also counts sets from unfinished workouts, while `total_workouts`/`total_minutes` only count finished ones.
- `StartWorkout` errors (missing name, inaccessible template) are plain errors → HTTP 500, not 400/404. It does not block a second active workout; `GetActiveWorkout` then returns the oldest.
- `UpdateWorkout` accepts an `ended_at` before `started_at` (negative duration) and lets a finished workout be re-ended.
- `UpdateSet`/`DeleteSet` do not filter soft-deleted `session_exercises` in the join, so sets of a removed exercise can still be edited.
- `RPE` is not range-checked; set fields cannot be cleared to null once set.
- Multi-step writes (start from template) use a manual delete instead of a transaction; the `MAX(...)` scans ignore errors.
