# `__tests__/features/workouts/lib/history.test.ts`

## Purpose

Unit tests for [history](../../../../features/workouts/lib/history.md). 7 tests.

## Public API

| `describe` | Tests | Covers |
|---|---|---|
| `workoutTotals` | 2 | All sets, completed sets and completed-only volume; zeros for an empty workout |
| `buildSavedWorkout` | 1 | Exercises, duration, unit, ISO date and totals from a fixed `now` |
| `sortByNewest` | 1 | Newest first, input not mutated |
| `overallStats` | 1 | Sums workouts, seconds and volume |
| `formatting` | 3 | `formatCompact` thresholds; `formatWorkoutSummary` line with no-break spaces; `formatWorkoutDay` today / yesterday / this year / other year |

## How it works

Pure functions, no mocks.

## Depends on

`@/features/workouts/lib/history`.

## Used by

`npx jest`.

## Tests

This is a test file.

## Gotchas / TODO

Not covered: the generated `id` and `name`, mixed-unit volume, the hook
[useWorkoutHistory](../../../../features/workouts/hooks/useWorkoutHistory.md).
