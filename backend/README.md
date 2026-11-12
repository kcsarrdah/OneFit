# OneFit backend

The Go API shared by the OneFit clients: the Expo app (`frontend/`) and the web Muscle Explorer (`web/`). It stores users' fasts, water intake, exercises, workout templates and workouts in SQLite, authenticates with Firebase, and serves public muscle reference content.

Stack: Go (module `onefit/backend`, `go 1.23.4` in `go.mod`; developed on 1.24), Gin, GORM with `github.com/glebarez/sqlite` (pure Go, no cgo), Firebase Admin SDK, godotenv.

## Run

```bash
cd backend
go run .            # listens on :3000 (or $PORT)
```

Run from `backend/`: the database (`onefit.db`), `.env` and the Firebase credentials file are resolved relative to the working directory. The database is created and migrated automatically on start.

Without valid Firebase credentials the server still starts (it logs a warning), but every protected endpoint returns 401. Public endpoints still work: `/`, `/health`, `/api/auth/firebase-test`, `/api/anatomy/*`.

In any mode other than `GIN_MODE=release`, startup deletes the user with ID 1 and recreates it as a test user. Do not point a dev server at data you care about.

## Test

```bash
cd backend
go test ./...
go vet ./...
```

Only the anatomy service has tests today. See [docs/tests/README.md](docs/tests/README.md) for coverage and the last result.

## Configuration

Set in the environment or in `backend/.env` (git-ignored). Names only:

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | HTTP port | `3000` |
| `GIN_MODE` | `debug` or `release` | debug |
| `CORS_ORIGINS` | comma-separated allowed origins | `http://localhost:3000` |
| `FIREBASE_CREDENTIALS_PATH` | path to the Firebase service-account JSON | `serviceAccountKey.json` |

The service-account JSON is a secret and is git-ignored. Get it from the Firebase console (Project settings → Service accounts).

## Folder structure

```
backend/
  main.go          startup: env, CORS, DB, Firebase, route registration
  routes/          one file per route group; attaches auth middleware
  middleware/      Firebase auth middleware
  controllers/     HTTP handlers (binding, status codes)
  services/        business logic and queries (+ anatomy tests)
  models/          GORM models, DB setup, anatomy types
  data/            muscles.json (embedded) and its loader
  queries/         raw SQL constants (unused)
  utils/           Firebase Admin helpers
  tests/           test plan (no Go tests here)
  docs/            per-file docs, API reference
  Data_&_API_Related_Documentation/   older API notes and ER diagrams
```

## Docs

- [docs/README.md](docs/README.md): architecture, index of every file's doc, and how to keep docs current.
- [docs/API.md](docs/API.md): every endpoint with auth, request and response shapes, and status codes.
