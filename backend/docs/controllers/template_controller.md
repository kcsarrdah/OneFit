# `controllers/template_controller.go`

## Purpose

HTTP handlers for workout templates and the exercises inside them.

## Public API

```go
type TemplateController struct { /* db, templateService */ }
func NewTemplateController(db *gorm.DB) *TemplateController
func (tc *TemplateController) GetTemplates(c *gin.Context)
func (tc *TemplateController) GetTemplate(c *gin.Context)
func (tc *TemplateController) CreateTemplate(c *gin.Context)
func (tc *TemplateController) UpdateTemplate(c *gin.Context)
func (tc *TemplateController) DeleteTemplate(c *gin.Context)
func (tc *TemplateController) AddExerciseToTemplate(c *gin.Context)
func (tc *TemplateController) RemoveExerciseFromTemplate(c *gin.Context)
func (tc *TemplateController) UpdateTemplateExercise(c *gin.Context)
```

All routes: Auth Firebase. `:exercise_id` = **Exercise** ID.

| Method | Path | Request | Response |
|---|---|---|---|
| `GET` | `/api/templates/` | query `category`?, `include_public`? (default `false`) | `200 {"templates": [WorkoutTemplate], "count": n}` |
| `GET` | `/api/templates/:id` | none | `200 {"template": WorkoutTemplate}` |
| `POST` | `/api/templates/` | `{"name": string (required), "description"?, "category"?, "is_public"?: bool}` | `201 {"message": "Template created successfully", "template"}` |
| `PUT` | `/api/templates/:id` | `{"name"?, "description"?, "category"?, "is_public"?}` | `200 {"message": "Template updated successfully", "template"}` |
| `DELETE` | `/api/templates/:id` | none | `200 {"message": "Template deleted successfully"}` |
| `POST` | `/api/templates/:id/exercises` | `{"exercise_id": uint (required), "order_index"?, "target_sets"?, "target_reps"?: string, "target_weight"?: number, "rest_seconds"?}` | `201 {"message": "Exercise added to template successfully", "template_exercise"}` |
| `PUT` | `/api/templates/:id/exercises/:exercise_id` | `{"order_index"?, "target_sets"?, "target_reps"?, "target_weight"?, "rest_seconds"?}` | `200 {"message": "Template exercise updated successfully", "template_exercise"}` |
| `DELETE` | `/api/templates/:id/exercises/:exercise_id` | none | `200 {"message": "Exercise removed from template successfully"}` |

Errors: 400 `Invalid template ID` / `Invalid exercise ID` / binding; 404 `Template not found` / `Template not found or not owned by user` / `Template or exercise not found` / `Template exercise not found`; 500 `Failed to ...`. Full detail: [API.md#templates-apitemplates](../API.md#templates-apitemplates).

## How it works

Parse ids, read the user from context, call `TemplateService`, map `gorm.ErrRecordNotFound` → 404, other errors → 500.

## Depends on

[services/template_service.go](../services/template_service.md), [models/workout_template.go](../models/workout_template.md), `gin`, `gorm`.

## Used by

[routes/template_routes.go](../routes/template_routes.md).

## Tests

none

## Gotchas / TODO

- Duplicate template name, exercise already in template, and template in use all return 500.
- `:exercise_id` means Exercise ID here but SessionExercise ID in the workout routes; easy to mix up in clients.
- `DuplicateTemplate` and `GetTemplateCategories` exist in the service but have no endpoint.
