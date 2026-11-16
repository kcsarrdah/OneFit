# `__tests__/features/workouts/lib/setLogging.test.ts`

## Purpose

Unit tests for [setLogging](../../../../features/workouts/lib/setLogging.md),
the logic behind swipe-to-log. 12 tests.

## Public API

| `describe` | Tests | Covers |
|---|---|---|
| `lastPerformance` | 2 | Newest workout wins with unordered history; never-completed sets and unknown exercises give `null` |
| `nextOptions` | 2 | Chest order: in session today, then most recent, then by name; `setsToday` counts only completed sets while `last` is from history |
| `starting numbers` | 3 | `startingSet`: last set today, else last time's first set, else 20 x 8 / 0 x 8 for Bodyweight |
| `nudging` | 3 | `weightStep` by equipment and unit; `nudge` rounding (0.1 + 0.2 = 0.3) and clamping; `formatWeight` |
| `relativeDay` | 1 | today, yesterday, weekday, last week, N weeks, last month, N months (local dates, fixed `now`) |
| `completedOnly` | 1 | Drops unfinished sets and empty exercises |

Fixtures: four saved workouts built from the real `EXERCISES` catalogue.

## How it works

Pure functions, no mocks.

## Depends on

`@/features/workouts/lib/setLogging`, `@/features/workouts/constants`.

## Used by

`npx jest`.

## Tests

This is a test file.

## Gotchas / TODO

Not covered: `formatSets` on its own (used indirectly), `nextOptions` with
`muscleGroup: null` ordering, ties on the same date, `lbs` steps for
dumbbells, `relativeDay` for future dates.
