# `routes/water_routes.go`

## Purpose

Registers the `/api/water` group.

## Public API

```go
func SetupWaterRoutes(router *gin.Engine, db *gorm.DB)
```

| Method | Path | Auth | Handler |
|---|---|---|---|
| `POST` | `/api/water/` | `AuthMiddleware` | `WaterController.LogWater` |
| `GET` | `/api/water/` | `AuthMiddleware` | `WaterController.GetWaterLogs` |
| `DELETE` | `/api/water/latest` | `AuthMiddleware` | `WaterController.DeleteLatestWaterLog` |
| `DELETE` | `/api/water/:id` | `AuthMiddleware` | `WaterController.DeleteWaterLog` |

Shapes: [controllers/water_controller.md](../controllers/water_controller.md), [API.md#water-apiwater](../API.md#water-apiwater).

## How it works

Group-level `AuthMiddleware`. Gin's router gives the static `/latest` segment priority over `/:id`.

## Depends on

[controllers/water_controller.go](../controllers/water_controller.md), [middleware/auth.go](../middleware/auth.md).

## Used by

[main.go](../main.md).

## Tests

none

## Gotchas / TODO

- The comment above `/latest` says "Delete a specific water log"; it deletes the most recent one.
