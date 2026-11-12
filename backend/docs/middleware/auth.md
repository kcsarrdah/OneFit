# `middleware/auth.go`

## Purpose

Gin middleware that authenticates a request with a Firebase ID token and loads (or creates) the matching local user.

## Public API

```go
const DEV_MODE = false   // true: skip token checks and act as the test user
const TEST_USER_ID = 1   // unused
func AuthMiddleware(db *gorm.DB) gin.HandlerFunc
```

Context keys set for handlers: `userId` (`uint`), `firebaseUID` (`string`), `user` (`*models.User`).

## How it works

1. If `DEV_MODE`: look up the user with Firebase UID `test-firebase-uid-123` (created by [main.go](../main.md) in non-release mode), set the context keys, continue. Missing user → `500 {"error": "Test user not found"}`.
2. Require `Authorization: Bearer <token>` (exact `Bearer`, exactly one space-separated token).
3. `utils.VerifyFirebaseToken(token)`.
4. Read `email` and `name` claims (name falls back to email) and call `UserService.GetOrCreateUserByFirebaseUID`.
5. Set context keys and `c.Next()`.

Errors (all abort the chain):

| Status | Body |
|---|---|
| 401 | `{"error": "Authorization header required"}` |
| 401 | `{"error": "Invalid token format. Use: Bearer <token>"}` |
| 401 | `{"error": "Invalid Firebase token", "details": err}` |
| 500 | `{"error": "Failed to get user", "details": err}` |

## Depends on

[utils/firebase.go](../utils/firebase.md), [services/user_service.go](../services/user_service.md), `gin`, `gorm`.

## Used by

Every protected route group: [routes/auth.go](../routes/auth.md) (after `/firebase-test`), [fasting](../routes/fasting_routes.md), [water](../routes/water_routes.md), [exercise](../routes/exercise_routes.md), [template](../routes/template_routes.md), [workout](../routes/workout_routes.md). Not anatomy.

## Tests

none

## Gotchas / TODO

- `DEV_MODE` is a compile-time constant. Flipping it to `true` disables auth for every route; never ship it. It is not tied to `GIN_MODE`.
- `"details"` echoes the internal error (token-verification or DB message) to the client.
- Each route group builds its own middleware instance and `UserService`; harmless but redundant.
- Profile name/email are only set on creation; later changes in Firebase are not synced.
