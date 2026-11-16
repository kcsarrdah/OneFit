# `features/workouts/screens/RoutinesScreen.tsx`

## Purpose

Built-in and custom routines, filtered by category. Start one to load its
exercises into the workout, duplicate or delete it from its ⋯ menu, or create
your own.

## Public API

`RoutinesScreen({ onStartRoutine: (routine: AnyRoutine) => void })`.

## How it works

- From [useCustomRoutines](../hooks/useCustomRoutines.md); a loading message
  until ready.
- [ScreenTitle](../../../components/ui/ScreenTitle.md) "Routines" with a
  "+ New" outline pill that opens [CreateCustomRoutineModal](../components/CreateCustomRoutineModal.md).
- A sideways strip of category chips (`ROUTINE_FILTERS`): 40 pt pills,
  outlined when idle, chalk fill with ground text when selected. The strip
  bleeds to the right edge.
- A [RoutineCard](../components/RoutineCard.md) per routine in
  `filterRoutines(routines, filter)`, or "No <category> routines yet."
- Duplicate and delete errors are logged to the console.
- Inset on the left by `contentInset` to clear the sidebar.

## Depends on

[useCustomRoutines](../hooks/useCustomRoutines.md), [routines](../lib/routines.md),
[RoutineCard](../components/RoutineCard.md), [CreateCustomRoutineModal](../components/CreateCustomRoutineModal.md),
[CenteredMessage](../components/CenteredMessage.md), [ScreenTitle](../../../components/ui/ScreenTitle.md),
[constants](../constants.md), [Colors](../../../constants/Colors.md).

## Used by

[WorkoutsTab](WorkoutsTab.md) (sidebar "Routines").

## Tests

The filtering: [routines.test](../../../__tests__/features/workouts/lib/routines.test.md). The screen: none.

## Gotchas / TODO

none.
