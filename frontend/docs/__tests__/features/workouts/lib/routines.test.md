# `__tests__/features/workouts/lib/routines.test.ts`

## Purpose

Unit tests for [routines](../../../../features/workouts/lib/routines.md). 9 tests.

## Public API

| `describe` | Tests | Covers |
|---|---|---|
| `createRoutine` | 1 | id, `isCustom` and dates from `now` |
| `duplicateOf` | 1 | A built-in copied as custom, named "(Copy)" |
| `allRoutines / isCustomRoutine` | 1 | Built-ins first (not custom), then the user's own |
| `filterRoutines` | 3 | `All`, one category, empty result |
| `searchExercises` | 3 | Case-insensitive name match, muscle-group filter, excluding picked exercises |

## How it works

Pure functions over the real `WORKOUT_ROUTINES` / `EXERCISES`.

## Depends on

`@/features/workouts/lib/routines`, `@/features/workouts/constants`.

## Used by

`npx jest`.

## Tests

This is a test file.

## Gotchas / TODO

Not covered: the hook [useCustomRoutines](../../../../features/workouts/hooks/useCustomRoutines.md)
(storage, delete).
