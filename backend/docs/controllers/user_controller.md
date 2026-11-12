# `controllers/user_controller.go`

## Purpose

HTTP handlers for the signed-in user's profile and settings, plus a public Firebase "ping".

## Public API

```go
type UserController struct { /* db, userService */ }
func NewUserController(db *gorm.DB) *UserController
func (uc *UserController) TestFirebase(c *gin.Context)
func (uc *UserController) GetProfile(c *gin.Context)
func (uc *UserController) UpdateProfile(c *gin.Context)
func (uc *UserController) UpdateSettings(c *gin.Context)
```

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| `GET` | `/api/auth/firebase-test` | none | none | `200 {"message", "status", "note"}` (static) |
| `GET` | `/api/auth/me` | Firebase | none | `200 {"user": User}` |
| `PUT` | `/api/auth/me` | Firebase | `{"name"?: string, "height"?: number, "weight"?: number}` | `200 {"message": "Profile updated successfully", "user": User}` |
| `PATCH` | `/api/auth/me/settings` | Firebase | `{"goals"?: string, "settings"?: string}` | `200 {"message": "Settings updated successfully", "user": User}` |

Errors: 400 binding; 500 `Failed to update profile` / `Failed to update settings`. Full detail: [API.md#auth-and-profile-apiauth](../API.md#auth-and-profile-apiauth).

## How it works

Reads `*models.User` from the `user` context key (set by the middleware), applies the non-nil input fields and saves via `UserService.UpdateUser`.

## Depends on

[services/user_service.go](../services/user_service.md), [models/user.go](../models/user.md), `gin`.

## Used by

[routes/auth.go](../routes/auth.md).

## Tests

none

## Gotchas / TODO

- `User` has no JSON tags, so responses use `ID`, `FirebaseUID`, `Email`, `Name`, `Height`, ... (Go case) and expose the Firebase UID.
- `goals`/`settings` must be strings; a JSON object is a 400. No validation of `height`/`weight` (negative allowed).
- `TestFirebase` does not test Firebase.
- `getUserFromContext` is copied in four controllers.
