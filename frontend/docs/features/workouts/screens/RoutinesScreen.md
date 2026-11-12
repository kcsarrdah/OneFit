# `features/workouts/screens/RoutinesScreen.tsx`

## Purpose

Built-in and custom routines, filtered by category. Start one to load its
exercises into the workout, duplicate it, or create your own.

## Public API

`RoutinesScreen({ onStartRoutine: (routine: AnyRoutine) => void })`.

## How it works

- Data from [useCustomRoutines](../hooks/useCustomRoutines.md); a loading
  [CenteredMessage](../components/CenteredMessage.md) until read.
- Header "Workout Routines" and an accent "+ Create" button that opens
  [CreateCustomRoutineModal](../components/CreateCustomRoutineModal.md).
- Category chips from `ROUTINE_FILTERS`; the list is
  [filterRoutines](../lib/routines.md) of all routines, each a
  [RoutineCard](../components/RoutineCard.md). Duplicate/delete errors are
  logged.

## Depends on

[useCustomRoutines](../hooks/useCustomRoutines.md), [routines](../lib/routines.md),
[RoutineCard](../components/RoutineCard.md), [CreateCustomRoutineModal](../components/CreateCustomRoutineModal.md),
[CenteredMessage](../components/CenteredMessage.md), [Button](../../../components/ui/Button.md),
[ThemedText](../../../components/ThemedText.md), [Colors](../../../constants/Colors.md).

## Used by

[WorkoutsTab](WorkoutsTab.md) (sidebar "Routines").

## Tests

none.

## Gotchas / TODO

- No left inset for the floating sidebar, which overlaps the left edge of the
  cards.
- Chips are `Button`s with hand-set accent colours; a shared chip component
  (PickNext has another) would remove duplication.
