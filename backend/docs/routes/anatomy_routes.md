# `routes/anatomy_routes.go`

## Purpose

Registers the public `/api/anatomy` group for muscle reference content.

## Public API

```go
func SetupAnatomyRoutes(router *gin.Engine)
```

| Method | Path | Auth | Handler |
|---|---|---|---|
| `GET` | `/api/anatomy/muscles` | none | `AnatomyController.GetMuscles` |
| `GET` | `/api/anatomy/muscles/:id` | none | `AnatomyController.GetMuscle` |

Shapes: [controllers/anatomy_controller.md](../controllers/anatomy_controller.md), [API.md#anatomy-apianatomy](../API.md#anatomy-apianatomy).

## How it works

Builds the `AnatomyService` once at startup (parsing the embedded JSON). If that fails, `log.Fatalf` stops the server: bad content is a startup failure, not a runtime 500. No DB and no auth.

## Depends on

[services/anatomy_service.go](../services/anatomy_service.md), [controllers/anatomy_controller.go](../controllers/anatomy_controller.md).

## Used by

[main.go](../main.md).

## Tests

none directly; content load is covered by [anatomy_service_test.go](../services/anatomy_service_test.md).

## Gotchas / TODO

none
