# `services/exercise_service_test.go`

## Purpose

DB tests for [exercise_service.go](exercise_service.md).

## Public API

| Test | Checks |
|---|---|
| `TestGetExercisesFilters` (10 subtests) | With the 5 seeded built-ins, one custom exercise for the caller and one for another user: `includeCustom` adds only the caller's own; `muscle_group` and `equipment` filter built-ins too when `includeCustom` is false (the old missing-parentheses bug); `search` works on SQLite and is case-insensitive (the old `ILIKE` 500); filters and search combine; no match returns an empty list. Checks names and order. |
| `TestCreateCustomExerciseNamesAreUniquePerUser` | A custom exercise may reuse a built-in's or another user's name; the same user gets `ErrConflict` (also with surrounding spaces, and when renaming onto an own name); a soft-deleted exercise's name can be reused. |

Helper: `exerciseNames([]models.Exercise) []string`.

## How it works

`package services`, on a fresh in-memory DB from [testutil.NewDB](../testutil/db.md), seeded with `SeedDefaultExercises`.

## Depends on

[exercise_service.go](exercise_service.md), [testutil/db.go](../testutil/db.md).

## Used by

`go test ./...`.

## Tests

Last run: see [tests/README.md](../tests/README.md).

## Gotchas / TODO

Not covered: `GetExerciseByID`, `UpdateCustomExercise` beyond the name conflict, `GetMuscleGroups`, `GetEquipmentTypes`, non-ASCII search.
