# `features/workouts/components/WorkoutHistoryCard.tsx`

## Purpose

One saved workout on the History screen: name, date, duration, exercises,
sets and volume, the exercise names, and a delete button.

## Public API

`WorkoutHistoryCard({ workout: SavedWorkout, onDelete: () => void })`.

## How it works

Four small [StatColumn](StatColumn.md)s: [formatDuration](../lib/history.md),
exercise count, `completedSets/totalSets`, `round(totalVolume) unit`. Date via
[formatWorkoutDate](../lib/history.md). A ghost "✕" button calls `onDelete`.

## Depends on

[Card](../../../components/ui/Card.md), [Button](../../../components/ui/Button.md),
[ThemedText](../../../components/ThemedText.md), [StatColumn](StatColumn.md),
[history](../lib/history.md), [Colors](../../../constants/Colors.md).

## Used by

[HistoryScreen](../screens/HistoryScreen.md).

## Tests

none.

## Gotchas / TODO

- Workouts are saved with [completedOnly](../lib/setLogging.md), so "Sets" always
  reads N/N.
- The "✕" button is 28 px (below the 44 px touch target) and has no
  accessible label; delete is immediate.
- Stats borders are `rgba(0,0,0,0.1)`, invisible on dark.
