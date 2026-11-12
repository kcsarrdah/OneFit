# `controllers/anatomy_controller.go`

## Purpose

Public, read-only HTTP handlers for the muscle reference content used by the web Muscle Explorer.

## Public API

```go
type AnatomyController struct { /* anatomyService */ }
func NewAnatomyController(anatomyService *services.AnatomyService) *AnatomyController
func (ac *AnatomyController) GetMuscles(c *gin.Context)
func (ac *AnatomyController) GetMuscle(c *gin.Context)
```

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| `GET` | `/api/anatomy/muscles` | none | query `region`? (`upper`\|`core`\|`lower`), `view`? (`front`\|`back`), `search`? | `200 {"muscles": [MuscleSummary], "count": n}` |
| `GET` | `/api/anatomy/muscles/:id` | none | path `id` (slug) | `200 {"muscle": Muscle}` |

Errors: 400 `region must be one of: upper, core, lower` / `view must be one of: front, back`; 404 `Muscle not found`; 500 `Failed to fetch muscle` (unreachable). Full detail: [API.md#anatomy-apianatomy](../API.md#anatomy-apianatomy).

## How it works

Validates `region` and `view` against the model constants (empty = no filter), passes them with `search` to `AnatomyService.ListMuscles`, and maps `ErrMuscleNotFound` to 404.

## Depends on

[services/anatomy_service.go](../services/anatomy_service.md), [models/muscle.go](../models/muscle.md), `gin`.

## Used by

[routes/anatomy_routes.go](../routes/anatomy_routes.md).

## Tests

none directly; the service it wraps is covered by [anatomy_service_test.go](../services/anatomy_service_test.md).

## Gotchas / TODO

- Validation is case-sensitive: `region=Upper` is a 400.
