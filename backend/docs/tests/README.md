# Backend tests

## How to run

```bash
cd backend
go test ./...            # all packages
go test -v ./services/   # verbose, the only package with tests
go vet ./...
```

Go tests live next to the code (`*_test.go` in the same package), so their docs live next to that code's docs. `backend/tests/` holds no Go tests, only [`test_plan_doc.md`](../../tests/test_plan_doc.md), a planning document.

## Last recorded result

2026-11-12, Go 1.24.5 (darwin/arm64), branch `docs/backend`:

```
?   onefit/backend               [no test files]
?   onefit/backend/controllers   [no test files]
?   onefit/backend/data          [no test files]
?   onefit/backend/middleware    [no test files]
?   onefit/backend/models        [no test files]
?   onefit/backend/queries       [no test files]
?   onefit/backend/routes        [no test files]
ok  onefit/backend/services      0.417s
?   onefit/backend/utils         [no test files]
```

4 tests, 7 subtests, all pass. `go vet ./...` is clean.

## Test files

| File | Covers | Doc |
|---|---|---|
| `services/anatomy_service_test.go` | `AnatomyService` (list filters, lookup, id validation) and the embedded `data/muscles.json` content | [services/anatomy_service_test.md](../services/anatomy_service_test.md) |

## Coverage summary

Covered: the anatomy feature's service layer and content (indirectly `data/anatomy.go` and `models/muscle.go`).

Not covered at all:

- Every DB-backed service: `user_service`, `exercise_service`, `template_service`, `workout_service`. Several verified bugs live here (SQLite `ILIKE`, filter precedence, global exercise-name uniqueness, soft-delete leaving children counted in stats); see [services/exercise_service.md](../services/exercise_service.md) and [services/workout_service.md](../services/workout_service.md).
- All controllers (status-code mapping, binding, validation such as fasting time checks and water date parsing).
- Routes and middleware (auth header parsing, 401 paths, public vs protected split).
- `main.go` startup behaviour (CORS, dev test-user reset).

## Adding tests

- DB services: open an in-memory SQLite DB with the same driver, `gorm.Open(sqlite.Open("file::memory:"), &gorm.Config{})` from `github.com/glebarez/sqlite`, and `AutoMigrate` the models you need. No cgo or external DB required.
- Controllers: `httptest` + a `gin.Engine` in test mode; set the `user`/`userId` context keys in a stub middleware instead of calling Firebase.
- Middleware: `utils.VerifyFirebaseToken` uses a package global; testing the success path needs a seam (e.g. an injectable verifier).
- Add a doc for each new test file at `docs/<same path>.md` and a row in the table above.

`test_plan_doc.md` describes a much larger planned suite (model, service, controller tests, fixtures, coverage targets). Almost none of it exists yet, and parts describe tables that are not in the models (e.g. `fasting_types`).
