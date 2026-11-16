# `features/workouts/lib/history.ts`

## Purpose

Pure helpers behind workout history: build a saved workout from a finished
session, the History screen's totals, and formatting.

## Public API

| Export | Signature | Does |
|---|---|---|
| `WorkoutTotals` | `{ totalSets, completedSets, totalVolume }` | |
| `workoutTotals` | `(exercises) => WorkoutTotals` | Volume = sum of weight x reps over completed sets |
| `buildSavedWorkout` | `(exercises, durationSeconds, weightUnit, now = new Date()) => SavedWorkout` | id `workout_<ms>_<random>`, name `Workout <locale date>`, ISO `date`, totals |
| `sortByNewest` | `(history) => SavedWorkout[]` | Copy, newest `date` first |
| `OverallStats` / `overallStats` | `(history) => { totalWorkouts, totalDuration (s), totalVolume }` | |
| `formatDuration` | `(seconds) => string` | `"12:34"` (m:ss; minutes not capped) |
| `formatWorkoutDate` | `(iso) => string` | `"Nov 12, 2026"` (en-US) |

## How it works

No state. `buildSavedWorkout` takes `now` so tests are deterministic.

## Depends on

[types](../types.md).

## Used by

[useWorkoutHistory](../hooks/useWorkoutHistory.md), [WorkoutHistoryCard](../components/WorkoutHistoryCard.md).

## Tests

[history.test](../../../__tests__/features/workouts/lib/history.test.md).

## Gotchas / TODO

- `overallStats.totalVolume` adds volumes across workouts in different units
  (kg and lbs) without converting.
- `formatDuration` shows long sessions as e.g. `95:00`, not `1:35:00`.
- The name uses the device locale (`toLocaleDateString()`), the date format
  is fixed en-US.
