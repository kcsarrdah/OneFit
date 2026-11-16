# `main.go`

## Purpose

Entry point (`package main`): loads config, opens the database, initialises Firebase, registers every route group and starts the Gin server.

## Public API

No exports. Unexported helpers: `setupDevData(db)`, `createTestUser(db)`. Two inline endpoints (no auth):

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| `GET` | `/` | none | none | `200 {"message": "Welcome to OneFit Backend!"}` |
| `GET` | `/health` | none | none | `200 {"status": "healthy", "database": "connected"}` |

See [API.md#root](API.md#root).

## How it works

1. `godotenv.Load()` reads `backend/.env` if present (logs and continues otherwise).
2. `GIN_MODE` (if set) is passed to `gin.SetMode`. `gin.Default()` adds Logger and Recovery middleware.
3. CORS: origins from `CORS_ORIGINS` (comma-split, default `http://localhost:3000`); methods `GET POST PUT PATCH DELETE OPTIONS`; headers `Origin Authorization Content-Type`.
4. `models.SetupDB()` opens `onefit.db` and runs `models.Migrate`.
5. `setupDevData`: if `GIN_MODE` is not `release`, `createTestUser` creates user ID 1 (Firebase UID `test-firebase-uid-123`, email `test@onefit.com`) only if no user 1 exists. An existing user 1 and its data are kept; only a missing Firebase UID is filled in.
6. `utils.InitFirebase()`; on failure it only logs a warning, so every protected route then answers 401.
7. Registers routes: auth, fasting, water, exercise, workout, template (all get `db`), anatomy (no db; `log.Fatalf` if the embedded content fails to load).
8. `r.Run(":" + PORT)` (default `3000`). The return error is ignored.

Env vars: `PORT`, `GIN_MODE`, `CORS_ORIGINS`, plus `FIREBASE_CREDENTIALS_PATH` (read in [utils/firebase.go](utils/firebase.md)).

## Depends on

[models/setup.go](models/setup.md), [routes/*](README.md#routes), [utils/firebase.go](utils/firebase.md), `gin`, `gin-contrib/cors`, `godotenv`, `gorm`.

## Used by

`go run .` / the built binary.

## Tests

[main_test.go](main_test.md): dev test-user setup.

## Gotchas / TODO

- In a dev database where a real Firebase user already has ID 1, no test user is created (and `DEV_MODE` would fail with `Test user not found`). If user 1 is missing but its email or Firebase UID belongs to another row, the create fails silently.
- The test user is only useful with `middleware.DEV_MODE = true` (currently `false`).
- `/health` is static; it does not ping the DB or Firebase.
- Default CORS origin `http://localhost:3000` is the API's own port; the Expo web app (8081) needs `CORS_ORIGINS`. The Vite web app proxies `/api`, so it does not.
- `onefit.db` is a relative path: the server must be started from `backend/`.
