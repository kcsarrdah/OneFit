# `__tests__/features/workouts/lib/session.test.ts`

## Purpose

Unit tests for [session](../../../../features/workouts/lib/session.md). 4 tests.

## Public API

| `describe` | Tests | Covers |
|---|---|---|
| `routineEntries` | 1 | Three placeholder sets per exercise, not completed, `ROUTINE_DEFAULT_SET` values, deterministic set ids from `now` |
| `logging and undo` | 3 | `withLoggedSet` touches one entry and does not mutate; `withoutLastSet` removes the newest; `setsLogged` counts completed sets only |

## How it works

Pure functions, no mocks.

## Depends on

`@/features/workouts/lib/session`, `@/features/workouts/constants`.

## Used by

`npx jest`.

## Tests

This is a test file.

## Gotchas / TODO

Not covered: `withoutLastSet` on an empty entry or one holding only
placeholders; the hook [useWorkoutSession](../../../../features/workouts/hooks/useWorkoutSession.md)
(storage, auto-save, `startExercise` reuse).
