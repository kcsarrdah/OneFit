# `features/workouts/components/WorkoutHistoryCard.tsx`

## Purpose

One saved workout on the History screen, as a row: name and day, its numbers
on one Oswald line, the exercises on one muted line, and a quiet × that asks
before deleting.

## Public API

`WorkoutHistoryCard({ workout: SavedWorkout, onDelete: () => void })`.

## How it works

- `formatWorkoutDay` ("Today, 7:12 PM", "Sat, Nov 14") under the name;
  `formatWorkoutSummary` ("52 MIN · 18/20 SETS · 4,240 KG", no-break spaces
  inside each item so it only wraps between items) in Oswald 17; exercise
  names joined, one line.
- The × (44 pt, `icon` colour) opens a [ConfirmDialog](../../../components/ui/ConfirmDialog.md)
  "Delete workout?"; confirming calls `onDelete`.

## Depends on

[ConfirmDialog](../../../components/ui/ConfirmDialog.md), [IconSymbol](../../../components/ui/IconSymbol.md),
[history](../lib/history.md), [Colors](../../../constants/Colors.md), [Fonts](../../../constants/Fonts.md).

## Used by

[HistoryScreen](../screens/HistoryScreen.md).

## Tests

The formatting: [history.test](../../../__tests__/features/workouts/lib/history.test.md). The component: none.

## Gotchas / TODO

Saved workouts are named "Workout <date>" by [history](../lib/history.md), so
the name and day repeat each other.
