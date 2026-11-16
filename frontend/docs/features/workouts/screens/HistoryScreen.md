# `features/workouts/screens/HistoryScreen.tsx`

## Purpose

Overall totals (workouts, minutes, volume) and every saved workout, newest
first.

## Public API

`HistoryScreen()`.

## How it works

From [useWorkoutHistory](../hooks/useWorkoutHistory.md):

- Loading: a centred message.
- Empty: [ScreenTitle](../../../components/ui/ScreenTitle.md) "History",
  "NO WORKOUTS YET" with a line on what will appear, and an
  [ActionButton](../../../components/ui/ActionButton.md) "Start a workout"
  that switches the sidebar to Workout (`setCurrentSidebarOption('workout')`).
- Otherwise: the title, [HistoryTotals](../components/HistoryTotals.md) with
  the [weight unit](../hooks/useWeightUnit.md), then a
  [WorkoutHistoryCard](../components/WorkoutHistoryCard.md) per workout.
- Inset on the left by `contentInset` to clear the sidebar.

## Depends on

[useWorkoutHistory](../hooks/useWorkoutHistory.md), [useWeightUnit](../hooks/useWeightUnit.md),
[HistoryTotals](../components/HistoryTotals.md), [WorkoutHistoryCard](../components/WorkoutHistoryCard.md),
[CenteredMessage](../components/CenteredMessage.md), [ActionButton](../../../components/ui/ActionButton.md),
[ScreenTitle](../../../components/ui/ScreenTitle.md), [NavigationContext](../../../contexts/NavigationContext.md),
[Colors](../../../constants/Colors.md), [Fonts](../../../constants/Fonts.md).

## Used by

[WorkoutsTab](WorkoutsTab.md) (sidebar "History").

## Tests

none.

## Gotchas / TODO

Volume mixes kg and lbs workouts (see [HistoryTotals](../components/HistoryTotals.md)).
