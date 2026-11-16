# `services/template_service_test.go`

## Purpose

DB tests for [template_service.go](template_service.md).

## Public API

| Test | Checks |
|---|---|
| `TestDeleteTemplateSoftDeletesExercises` | Deleting a template soft-deletes its `template_exercises`, so the custom exercise it used can then be deleted. |

## How it works

`package services` on a fresh in-memory DB from [testutil.NewDB](../testutil/db.md); uses `liveCount` from [workout_service_test.go](workout_service_test.md).

## Depends on

[template_service.go](template_service.md), [exercise_service.go](exercise_service.md), [testutil/db.go](../testutil/db.md).

## Used by

`go test ./...`.

## Tests

Last run: see [tests/README.md](../tests/README.md).

## Gotchas / TODO

Not covered: listing with public templates, updates, `DuplicateTemplate`, exercise reordering. Conflict errors are covered through the HTTP layer in [controllers/errors_test.go](../controllers/errors_test.md).
