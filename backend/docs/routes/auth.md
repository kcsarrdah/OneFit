# `routes/auth.go`

## Purpose

Registers the `/api/auth` group: one public endpoint and the signed-in user's profile endpoints.

## Public API

```go
func SetupAuthRoutes(router *gin.Engine, db *gorm.DB)
```

| Method | Path | Auth | Handler |
|---|---|---|---|
| `GET` | `/api/auth/firebase-test` | none | `UserController.TestFirebase` |
| `GET` | `/api/auth/me` | `AuthMiddleware` | `UserController.GetProfile` |
| `PUT` | `/api/auth/me` | `AuthMiddleware` | `UserController.UpdateProfile` |
| `PATCH` | `/api/auth/me/settings` | `AuthMiddleware` | `UserController.UpdateSettings` |

Shapes: [controllers/user_controller.md](../controllers/user_controller.md), [API.md#auth-and-profile-apiauth](../API.md#auth-and-profile-apiauth).

## How it works

`auth.Use(middleware.AuthMiddleware(db))` is called after `/firebase-test` is registered; Gin group middleware only applies to routes added after `Use`, which keeps that one route public.

## Depends on

[controllers/user_controller.go](../controllers/user_controller.md), [middleware/auth.go](../middleware/auth.md).

## Used by

[main.go](../main.md).

## Tests

none

## Gotchas / TODO

- The public/protected split depends on registration order; adding a route above the `Use` line makes it public.
- No register/login routes by design (Firebase client SDK).
