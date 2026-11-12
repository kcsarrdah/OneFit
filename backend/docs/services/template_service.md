# `services/template_service.go`

## Purpose

Workout template CRUD and management of the exercises inside a template.

## Public API

```go
type TemplateService struct { /* db */ }
func NewTemplateService(db *gorm.DB) *TemplateService

func (ts *TemplateService) GetUserTemplates(userID uint, category string, includePublic bool) ([]models.WorkoutTemplate, error)
func (ts *TemplateService) GetTemplateWithExercises(userID, templateID uint) (*models.WorkoutTemplate, error)
func (ts *TemplateService) CreateTemplate(userID uint, name, description, category string, isPublic bool) (*models.WorkoutTemplate, error)
func (ts *TemplateService) UpdateTemplate(userID, templateID uint, name, description, category *string, isPublic *bool) (*models.WorkoutTemplate, error)
func (ts *TemplateService) DeleteTemplate(userID, templateID uint) error
func (ts *TemplateService) AddExerciseToTemplate(userID, templateID, exerciseID uint, orderIndex, targetSets int, targetReps string, targetWeight *float64, restSeconds int) (*models.TemplateExercise, error)
func (ts *TemplateService) RemoveExerciseFromTemplate(userID, templateID, exerciseID uint) error
func (ts *TemplateService) UpdateTemplateExercise(userID, templateID, exerciseID uint, orderIndex, targetSets *int, targetReps *string, targetWeight *float64, restSeconds *int) (*models.TemplateExercise, error)
func (ts *TemplateService) GetTemplateCategories(userID uint) ([]string, error)                               // unused
func (ts *TemplateService) DuplicateTemplate(userID, templateID uint, newName string) (*models.WorkoutTemplate, error) // unused
```

`exerciseID` in the template-exercise methods is the **Exercise** ID; rows are found by `(template_id, exercise_id)`.

## How it works

- Read access: own templates, plus public ones (`GetUserTemplates` with `includePublic`, `GetTemplateWithExercises` always). Write access (update, delete, add/update/remove exercises): owner only, via `id = ? AND user_id = ?`, else `ErrRecordNotFound`.
- `GetUserTemplates`: preloads `Exercises.Exercise` (no order), `created_at DESC`.
- `GetTemplateWithExercises`: preloads exercises ordered by `order_index`.
- Create/Update trim strings and enforce unique names per user (service check, no DB index).
- `DeleteTemplate`: refuses if any non-deleted `workout_sessions.template_id` points at it; soft-deletes the template only.
- `AddExerciseToTemplate`: checks the exercise exists and is not already in the template; `orderIndex == 0` → `MAX(order_index) + 1`; returns the row with `Exercise` preloaded.
- `DuplicateTemplate`: copies a readable template and its exercises as a private template (default name `"<name> (Copy)"`).

## Depends on

[models/workout_template.go](../models/workout_template.md), [models/exercise.go](../models/exercise.md), [models/workout_session.go](../models/workout_session.md), `gorm`.

## Used by

[controllers/template_controller.go](../controllers/template_controller.md).

## Tests

none

## Gotchas / TODO

- "Already exists", "already in this template" and "being used in workout sessions" are plain errors → HTTP 500.
- `AddExerciseToTemplate` accepts any exercise ID, including other users' custom exercises.
- Soft-deleted templates leave `template_exercises` rows behind (no cascade).
- Multi-row writes (`DuplicateTemplate`) are not in a transaction.
- `MAX(order_index)` reads ignore the scan error; concurrent appends can get the same index.
