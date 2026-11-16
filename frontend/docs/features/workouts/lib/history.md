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
| `formatCompact` | `(n) => string` | `"4,240"` below 10,000, then `"24.3k"`, `"1.2M"` |
| `formatWorkoutSummary` | `(workout) => string` | `"52 MIN · 18/20 SETS · 4,240 KG"`, no-break space inside each item |
| `formatWorkoutDay` | `(iso, now = new Date()) => string` | `"Today, 7:12 PM"`, `"Yesterday, 6:05 PM"`, `"Sat, Nov 14"`, plus the year when not this year |

## How it works

No state. `buildSavedWorkout` and `formatWorkoutDay` take `now` so tests are deterministic.

## Depends on

[types](../types.md).

## Used by

[useWorkoutHistory](../hooks/useWorkoutHistory.md), [WorkoutHistoryCard](../components/WorkoutHistoryCard.md),
[HistoryTotals](../components/HistoryTotals.md).

## Tests

[history.test](../../../__tests__/features/workouts/lib/history.test.md).

## Gotchas / TODO

- `overallStats.totalVolume` adds volumes across workouts in different units
  (kg and lbs) without converting.
- The name uses the device locale (`toLocaleDateString()`); the day and
  number formats are fixed en-US.
