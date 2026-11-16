# `models/setup_test.go`

## Purpose

Proves [`Migrate`](setup.md) upgrades older databases whose `exercises.name` was globally unique.

## Public API

| Test | Checks |
|---|---|
| `TestMigrateDropsGlobalExerciseNameIndex` | After recreating the old `idx_exercises_name` unique index, `Migrate` removes it and two exercises with the same name can be inserted. |

## How it works

External test package (`models_test`), because [testutil](../testutil/db.md) imports `models`. Uses an in-memory DB from `testutil.NewDB`.

## Depends on

[setup.go](setup.md), [exercise.go](exercise.md), [testutil/db.go](../testutil/db.md).

## Used by

`go test ./...`.

## Tests

Last run: see [tests/README.md](../tests/README.md).

## Gotchas / TODO

Does not open a real `onefit.db`; the index name matches the one GORM created from the old `uniqueIndex` tag.
