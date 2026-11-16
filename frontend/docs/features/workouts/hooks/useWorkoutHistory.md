# `features/workouts/hooks/useWorkoutHistory.ts`

## Purpose

Saved workouts on the device, newest first: save a finished workout, delete
one, and the overall totals.

## Public API

`useWorkoutHistory()` returns `{ workoutHistory: SavedWorkout[], isLoading, overallStats: OverallStats, saveWorkout(exercises, durationSeconds, weightUnit) => Promise<SavedWorkout>, deleteWorkout(id) => Promise<void> }`.

## How it works

- AsyncStorage key **`workout_history`**: `SavedWorkout[]`, newest first.
- Loads once on mount and sorts with [sortByNewest](../lib/history.md).
- `saveWorkout` builds the record with [buildSavedWorkout](../lib/history.md),
  prepends it, writes the whole array, then updates state.
- `overallStats` is memoised from the list.

## Depends on

[useAsyncStorage](../../../hooks/useAsyncStorage.md), [history](../lib/history.md), [types](../types.md).

## Used by

[WorkoutScreen](../screens/WorkoutScreen.md) (last-time numbers, saving),
[HistoryScreen](../screens/HistoryScreen.md) (list, stats, delete).

## Tests

none (pure parts: [history.test](../../../__tests__/features/workouts/lib/history.test.md)).

## Gotchas / TODO

- Each caller has its own copy of the list; they do not sync. It works today
  because the History screen remounts (and reloads) every time it is opened.
- History grows without limit and is rewritten in full on every save.
- Storage errors are swallowed by `useAsyncStorage`, so a failed write still
  updates the in-memory list.
