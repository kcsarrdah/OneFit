# Backend tests

## How to run

```bash
cd backend
go test ./...            # all packages
go test -v ./controllers/ ./services/
go vet ./...
```

Go tests live next to the code (`*_test.go` in the same package), so their docs live next to that code's docs. `backend/tests/` holds no Go tests, only [`test_plan_doc.md`](../../tests/test_plan_doc.md), a planning document.

## Last recorded result

2026-11-16, Go 1.24.5 (darwin/arm64), branch `fix/backend-dev-test-user` (top of the backend bug-fix stack):

```
ok  onefit/backend               1.198s
ok  onefit/backend/controllers   0.545s
?   onefit/backend/data          [no test files]
?   onefit/backend/middleware    [no test files]
ok  onefit/backend/models        1.690s
?   onefit/backend/queries       [no test files]
?   onefit/backend/routes        [no test files]
ok  onefit/backend/services      2.239s
?   onefit/backend/testutil      [no test files]
?   onefit/backend/utils         [no test files]
```

17 tests, 28 subtests, all pass. `go vet ./...` is clean.

## Test files

| File | Covers | Doc |
|---|---|---|
| `main_test.go` | Dev test user created when missing, kept across restarts, skipped in release mode | [main_test.md](../main_test.md) |
| `controllers/errors_test.go` | Service errors → 400/404/409 through the exercise, template and workout handlers | [controllers/errors_test.md](../controllers/errors_test.md) |
| `models/setup_test.go` | `Migrate` drops the old global exercise-name index | [models/setup_test.md](../models/setup_test.md) |
| `services/exercise_service_test.go` | `ExerciseService` queries and custom-exercise rules | [services/exercise_service_test.md](../services/exercise_service_test.md) |
| `services/template_service_test.go` | Template delete soft-deletes its exercises | [services/template_service_test.md](../services/template_service_test.md) |
| `services/workout_service_test.go` | Workout/exercise deletes soft-delete children; stats skip deleted rows | [services/workout_service_test.md](../services/workout_service_test.md) |
| `services/anatomy_service_test.go` | `AnatomyService` (list filters, lookup, id validation) and the embedded `data/muscles.json` content | [services/anatomy_service_test.md](../services/anatomy_service_test.md) |

## Coverage summary

Covered: the anatomy feature's service layer and content (indirectly `data/anatomy.go` and `models/muscle.go`); exercise filters, search and per-user names; workout/template delete cascades and stats; 400/404/409 error mapping; the exercise-name migration; the dev test user.

Not covered:

- DB-backed services beyond the cases above: `user_service`, most of `template_service` and `workout_service`, and `exercise_service` update paths.
- Controllers other than the 4xx error mapping (binding, fasting time checks, water date parsing, 500 paths).
- Routes and middleware (auth header parsing, 401 paths, public vs protected split).
- `main.go` startup beyond the dev test user (CORS, route wiring).

## Adding tests

- DB services: `testutil.NewDB(t)` ([testutil/db.go](../testutil/db.md)) gives a migrated in-memory SQLite DB private to the test; `testutil.NewUser` adds a user. No cgo or external DB required.
- Controllers: `newTestRouter` in [controllers/helpers_test.go](../controllers/helpers_test.md) sets the `user`/`userId` context keys instead of calling Firebase; `do`/`mustDo` send JSON requests.
- Middleware: `utils.VerifyFirebaseToken` uses a package global; testing the success path needs a seam (e.g. an injectable verifier).
- Add a doc for each new test file at `docs/<same path>.md` and a row in the table above.

`test_plan_doc.md` describes a much larger planned suite (model, service, controller tests, fixtures, coverage targets). Almost none of it exists yet, and parts describe tables that are not in the models (e.g. `fasting_types`).
