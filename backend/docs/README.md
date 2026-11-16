# Backend docs

Per-file documentation for the OneFit Go backend. `backend/docs/` mirrors the source tree: `backend/<path>/<file>.go` is documented in `backend/docs/<path>/<file>.md`.

- [API.md](API.md): the full HTTP API reference (40 endpoints).
- [_TEMPLATE.md](_TEMPLATE.md): the template every doc follows.
- [tests/README.md](tests/README.md): test coverage and how to run tests.
- [../README.md](../README.md): what the backend is and how to run it.

## Architecture

```
HTTP request
  → Gin engine (main.go: Logger, Recovery, CORS)
  → routes/*          group + path → handler; attaches AuthMiddleware to protected groups
  → middleware/auth   Firebase ID token → local User in the Gin context
  → controllers/*     bind/validate JSON and params, map errors to status codes
  → services/*        business rules, ownership checks, GORM queries
  → models/*          GORM structs (tables) + anatomy types
  → SQLite (onefit.db)            or  data/muscles.json (embedded, anatomy only)
```

Exceptions: the fasting and water controllers query GORM directly (no service). Anatomy has no DB at all: [routes/anatomy_routes.go](routes/anatomy_routes.md) builds an in-memory [AnatomyService](services/anatomy_service.md) from the embedded JSON at startup.

### Auth

Firebase Authentication. The client signs in with the Firebase SDK and sends `Authorization: Bearer <ID token>`. [middleware/auth.go](middleware/auth.md) verifies it via the Admin SDK ([utils/firebase.go](utils/firebase.md)), then gets or creates the local `users` row by Firebase UID and stores `userId`, `firebaseUID` and `user` in the context. There are no register/login endpoints. Public routes: `/`, `/health`, `/api/auth/firebase-test`, `/api/anatomy/*`.

### Database

SQLite through GORM and `github.com/glebarez/sqlite` (pure Go, no cgo). [models/setup.go](models/setup.md) opens `onefit.db` in the working directory and runs `AutoMigrate` for every model on each start; there are no versioned migrations, and AutoMigrate never drops or renames columns. Every model embeds [`Base`](models/base.md), so deletes are soft (`deleted_at`) and `ON DELETE CASCADE` never fires.

### Config

Environment variables (from the process or `backend/.env` via godotenv). Names only; never put values in docs:

| Variable | Used in | Default |
|---|---|---|
| `PORT` | `main.go` | `3000` |
| `GIN_MODE` | `main.go` | Gin default (debug). Anything but `release` also resets the dev test user. |
| `CORS_ORIGINS` | `main.go` | `http://localhost:3000` |
| `FIREBASE_CREDENTIALS_PATH` | `utils/firebase.go` | `serviceAccountKey.json` |

Secrets: `backend/.env` and the Firebase service-account JSON are git-ignored.

## Index

### Root

- [main.md](main.md): `main.go`, startup, CORS, dev test user, `/` and `/health`.

### Routes

- [routes/auth.md](routes/auth.md): `/api/auth` group, public `firebase-test` + protected `me` routes.
- [routes/fasting_routes.md](routes/fasting_routes.md): `/api/fasts` group.
- [routes/water_routes.md](routes/water_routes.md): `/api/water` group.
- [routes/exercise_routes.md](routes/exercise_routes.md): `/api/exercises` group.
- [routes/template_routes.md](routes/template_routes.md): `/api/templates` group.
- [routes/workout_routes.md](routes/workout_routes.md): `/api/workouts` group.
- [routes/anatomy_routes.md](routes/anatomy_routes.md): public `/api/anatomy` group.

### Middleware

- [middleware/auth.md](middleware/auth.md): Firebase token check and user loading; `DEV_MODE` bypass.

### Controllers

- [controllers/user_controller.md](controllers/user_controller.md): profile and settings handlers.
- [controllers/auth.md](controllers/auth.md): unused pre-Firebase auth types (dead code).
- [controllers/fasting_controller.md](controllers/fasting_controller.md): save fast, fasting history.
- [controllers/water_controller.md](controllers/water_controller.md): water log CRUD.
- [controllers/exercise_controller.md](controllers/exercise_controller.md): exercise library and custom exercises.
- [controllers/template_controller.md](controllers/template_controller.md): templates and template exercises.
- [controllers/workout_controller.md](controllers/workout_controller.md): workouts, session exercises, sets, stats.
- [controllers/anatomy_controller.md](controllers/anatomy_controller.md): muscle list and detail.

### Services

- [services/user_service.md](services/user_service.md): get-or-create user by Firebase UID, save profile.
- [services/exercise_service.md](services/exercise_service.md): exercise queries and custom CRUD (has verified bugs).
- [services/template_service.md](services/template_service.md): template CRUD, template exercises, duplicate.
- [services/workout_service.md](services/workout_service.md): workout lifecycle, sets, active workout, stats.
- [services/anatomy_service.md](services/anatomy_service.md): in-memory muscle list/filter/lookup.
- [services/anatomy_service_test.md](services/anatomy_service_test.md): tests for the anatomy service and content.

### Models

- [models/base.md](models/base.md): `ID`, timestamps, soft delete.
- [models/setup.md](models/setup.md): open SQLite, AutoMigrate.
- [models/user.md](models/user.md): `users`.
- [models/fast_session.md](models/fast_session.md): `fast_sessions`.
- [models/water_log.md](models/water_log.md): `water_logs`.
- [models/exercise.md](models/exercise.md): `exercises`.
- [models/workout_template.md](models/workout_template.md): `workout_templates`, `template_exercises`.
- [models/workout_session.md](models/workout_session.md): `workout_sessions`, `session_exercises`, `exercise_sets`.
- [models/meal.md](models/meal.md): `meals` (migrated, unused).
- [models/muscle.md](models/muscle.md): anatomy types (not a table).

### Data

- [data/anatomy.md](data/anatomy.md): embeds and parses `muscles.json`.
- [data/muscles.md](data/muscles.md): schema and contents of `muscles.json`.

### Queries

- [queries/user_queries.md](queries/user_queries.md): raw SQL constants (unused).

### Utils

- [utils/firebase.md](utils/firebase.md): Firebase Admin init and token verification.

### Tests

- [tests/README.md](tests/README.md): coverage summary, last result, how to add tests.

### Older docs (kept, partly outdated)

- [`../Data_&_API_Related_Documentation/`](../Data_&_API_Related_Documentation/): earlier endpoint list and ER diagrams. Differences from the code are listed in [API.md#mismatches-with-older-docs](API.md#mismatches-with-older-docs).
- [`../tests/test_plan_doc.md`](../tests/test_plan_doc.md): planned test suite (mostly not implemented).

## Keeping docs current (repo rule 2)

In the same change as the code:

1. New source or test file → new doc at the mirrored path, following [_TEMPLATE.md](_TEMPLATE.md), plus a line in the index above.
2. Changed file → update its doc (signatures, behaviour, gotchas).
3. Deleted file → delete its doc and its index line.
4. Any endpoint added, removed or changed (path, auth, body, response, status codes) → update [API.md](API.md), the controller doc and the route doc.
5. Tests added or changed → update the test file's doc and [tests/README.md](tests/README.md) (re-run `go test ./...` and record the result).
6. Never copy secrets (`.env`, the service-account key, tokens) into docs; refer to them by name.
