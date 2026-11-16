# `features/workouts/screens/HistoryScreen.tsx`

## Purpose

Overall progress (workouts, minutes, volume) and every saved workout, newest
first.

## Public API

`HistoryScreen()`.

## How it works

From [useWorkoutHistory](../hooks/useWorkoutHistory.md): a loading message,
an empty state ("No Workouts Yet"), or a "Your Progress" card with three
[StatColumn](../components/StatColumn.md)s (`totalWorkouts`, minutes =
`round(totalDuration / 60)`, `round(totalVolume)`) above a list of
[WorkoutHistoryCard](../components/WorkoutHistoryCard.md)s.

## Depends on

[useWorkoutHistory](../hooks/useWorkoutHistory.md), [StatColumn](../components/StatColumn.md),
[WorkoutHistoryCard](../components/WorkoutHistoryCard.md), [CenteredMessage](../components/CenteredMessage.md),
[Card](../../../components/ui/Card.md), [ThemedText](../../../components/ThemedText.md), [Colors](../../../constants/Colors.md).

## Used by

[WorkoutsTab](WorkoutsTab.md) (sidebar "History").

## Tests

none.

## Gotchas / TODO

- "Total Volume" has no unit and mixes kg and lbs workouts.
- Delete on a card is immediate, without confirmation.
- No sidebar inset.
