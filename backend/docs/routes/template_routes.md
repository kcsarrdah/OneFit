# `routes/template_routes.go`

## Purpose

Registers the `/api/templates` group: template CRUD and template-exercise management.

## Public API

```go
func SetupTemplateRoutes(router *gin.Engine, db *gorm.DB)
```

| Method | Path | Auth | Handler |
|---|---|---|---|
| `GET` | `/api/templates/` | `AuthMiddleware` | `TemplateController.GetTemplates` |
| `GET` | `/api/templates/:id` | `AuthMiddleware` | `TemplateController.GetTemplate` |
| `POST` | `/api/templates/` | `AuthMiddleware` | `TemplateController.CreateTemplate` |
| `PUT` | `/api/templates/:id` | `AuthMiddleware` | `TemplateController.UpdateTemplate` |
| `DELETE` | `/api/templates/:id` | `AuthMiddleware` | `TemplateController.DeleteTemplate` |
| `POST` | `/api/templates/:id/exercises` | `AuthMiddleware` | `TemplateController.AddExerciseToTemplate` |
| `PUT` | `/api/templates/:id/exercises/:exercise_id` | `AuthMiddleware` | `TemplateController.UpdateTemplateExercise` |
| `DELETE` | `/api/templates/:id/exercises/:exercise_id` | `AuthMiddleware` | `TemplateController.RemoveExerciseFromTemplate` |

`:exercise_id` is the Exercise ID. Shapes: [controllers/template_controller.md](../controllers/template_controller.md), [API.md#templates-apitemplates](../API.md#templates-apitemplates).

## How it works

Group-level `AuthMiddleware`.

## Depends on

[controllers/template_controller.go](../controllers/template_controller.md), [middleware/auth.go](../middleware/auth.md).

## Used by

[main.go](../main.md).

## Tests

none

## Gotchas / TODO

none
