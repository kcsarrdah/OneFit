# `services/workout_service_test.go`

## Purpose

DB tests for [workout_service.go](workout_service.md): deletes cascade to child rows and stats ignore deleted rows.

## Public API

| Test | Checks |
|---|---|
| `TestDeleteWorkoutSoftDeletesChildrenAndStats` | Deleting one of two finished workouts soft-deletes its session exercises and sets, leaves the other workout's rows, and stats report 1 workout and 2 sets. Once both workouts are deleted, the custom exercise they used can be deleted. |
| `TestStatsIgnoreSetsOfDeletedParents` | A workout soft-deleted without its children (as before the fix) no longer adds to `total_sets`. |
| `TestRemoveExerciseFromWorkoutSoftDeletesSets` | Removing an exercise from a workout soft-deletes its sets. |

Helpers (also used by [template_service_test.go](template_service_test.md)): `liveCount(t, db, model, query, args...) int64` counts non-deleted rows; `finishedWorkoutWithSets(t, ws, userID, exerciseID, sets)` starts a workout, adds an exercise, logs `sets` sets and ends it.

## How it works

`package services`, each test on a fresh in-memory DB from [testutil.NewDB](../testutil/db.md).

## Depends on

[workout_service.go](workout_service.md), [exercise_service.go](exercise_service.md), [testutil/db.go](../testutil/db.md).

## Used by

`go test ./...`.

## Tests

Last run: see [tests/README.md](../tests/README.md).

## Gotchas / TODO

Not covered: `GetUserWorkouts` paging and dates, `UpdateWorkout` edge cases, `UpdateSet`/`DeleteSet`, `GetActiveWorkout`, starting from a template.
