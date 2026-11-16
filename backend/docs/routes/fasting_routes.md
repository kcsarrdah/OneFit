# `routes/fasting_routes.go`

## Purpose

Registers the `/api/fasts` group (renamed from `/api/fasting` to match the app).

## Public API

```go
func SetupFastingRoutes(router *gin.Engine, db *gorm.DB)
```

| Method | Path | Auth | Handler |
|---|---|---|---|
| `POST` | `/api/fasts/` | `AuthMiddleware` | `FastingController.SaveFast` |
| `GET` | `/api/fasts/history` | `AuthMiddleware` | `FastingController.GetHistory` |

Shapes: [controllers/fasting_controller.md](../controllers/fasting_controller.md), [API.md#fasting-apifasts](../API.md#fasting-apifasts).

## How it works

Group-level `AuthMiddleware`.

## Depends on

[controllers/fasting_controller.go](../controllers/fasting_controller.md), [middleware/auth.go](../middleware/auth.md).

## Used by

[main.go](../main.md).

## Tests

none

## Gotchas / TODO

- `POST /api/fasts` (no slash) is redirected to `/api/fasts/` with 307.
