# `services/exercise_service.go`

## Purpose

Exercise library queries and custom-exercise CRUD.

## Public API

```go
type ExerciseService struct { /* db */ }
func NewExerciseService(db *gorm.DB) *ExerciseService

func (es *ExerciseService) GetExercises(userID uint, muscleGroup, equipment, search string, includeCustom bool) ([]models.Exercise, error)
func (es *ExerciseService) GetExerciseByID(exerciseID uint) (*models.Exercise, error)
func (es *ExerciseService) CreateCustomExercise(userID uint, name, muscleGroups, equipment, instructions string) (*models.Exercise, error)
func (es *ExerciseService) UpdateCustomExercise(userID, exerciseID uint, name, muscleGroups, equipment, instructions *string) (*models.Exercise, error)
func (es *ExerciseService) DeleteCustomExercise(userID, exerciseID uint) error
func (es *ExerciseService) GetMuscleGroups() ([]string, error)   // unused
func (es *ExerciseService) GetEquipmentTypes() ([]string, error) // unused
func (es *ExerciseService) SeedDefaultExercises() error          // unused
```

## How it works

- `GetExercises` builds a WHERE string: built-ins (`is_custom = false OR NULL`), plus the user's own custom exercises when `includeCustom`; then `LIKE %x%` for `muscleGroup` and `equipment`, `ILIKE` for `search`. Order: `is_custom ASC, name ASC`.
- `GetExerciseByID`: any row by primary key (no ownership check).
- `CreateCustomExercise`: rejects a blank name, rejects a name the user already has (untrimmed comparison), inserts trimmed values with `IsCustom = true`, `CreatedByUserID = userID`.
- `UpdateCustomExercise`: loads `id + created_by_user_id + is_custom = true` (else `ErrRecordNotFound`), checks the new trimmed name against the user's other exercises, applies non-nil fields (blank name ignored), `Save`.
- `DeleteCustomExercise`: same ownership lookup; refuses (`cannot delete exercise: it is being used ...`) if any `template_exercises` or `session_exercises` row references it; then soft-deletes.
- `SeedDefaultExercises`: if the table is empty, inserts 5 built-ins (Push-ups, Squats, Pull-ups, Plank, Deadlift).
- `GetMuscleGroups` / `GetEquipmentTypes`: `DISTINCT` raw column values (comma-joined strings, not split).

## Depends on

[models/exercise.go](../models/exercise.md), [models/workout_template.go](../models/workout_template.md), [models/workout_session.go](../models/workout_session.md), `gorm`.

## Used by

[controllers/exercise_controller.go](../controllers/exercise_controller.md).

## Tests

none

## Gotchas / TODO

- **Bug (verified):** `search` uses `name ILIKE ?`. SQLite has no `ILIKE`; any search returns `SQL logic error: near "ILIKE"` → HTTP 500. Use `LIKE` (case-insensitive for ASCII in SQLite) or `LOWER(name) LIKE`.
- **Bug (verified):** with `includeCustom = false`, the first condition `is_custom = ? OR is_custom IS NULL` is not parenthesised, so `... OR is_custom IS NULL AND muscle_groups LIKE ?` applies the filters only to NULL rows: built-ins come back unfiltered (a `legs` filter returned both test exercises).
- **Bug (verified):** names are globally unique in the DB (see [models/exercise.md](../models/exercise.md)), so the per-user duplicate check is not enough; a clash with a built-in or another user's exercise fails on insert with a 500.
- Service validation errors (blank/duplicate name, in use) are plain `fmt.Errorf`s; the controller turns them into 500, not 400/409.
- `SeedDefaultExercises` is never called: a fresh database has no built-in exercises.
- The in-use check counts `template_exercises` / `session_exercises` rows left behind when their template or workout was soft-deleted, so an exercise used only in deleted workouts can never be deleted.
