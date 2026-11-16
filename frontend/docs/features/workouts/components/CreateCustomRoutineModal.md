# `features/workouts/components/CreateCustomRoutineModal.tsx`

## Purpose

Two-step dialog for a custom routine: details, then exercises. Everything
resets when it closes.

## Public API

`CreateCustomRoutineModal({ visible: boolean, onClose: () => void, onCreateRoutine: (routine: NewRoutine) => Promise<void> })`.

## How it works

- Holds the form: `details` (defaults: 30 min, Beginner, Full Body),
  `selectedExercises`, `currentStep` (1 or 2), the step-2 search and muscle
  filter, and `isLoading`.
- Step 1 renders [RoutineDetailsStep](RoutineDetailsStep.md); "Next" needs a
  name. Step 2 renders [RoutineExercisesStep](RoutineExercisesStep.md);
  "Create Routine" needs a name and one exercise.
- Submit trims name and description, awaits `onCreateRoutine`, then
  `handleClose()` (reset + `onClose`). Validation and failures use `alert()`.
- Inside a [Dialog](../../../components/ui/Dialog.md); the form scrolls (max
  400 px).

## Depends on

[Dialog](../../../components/ui/Dialog.md), [Button](../../../components/ui/Button.md),
[ThemedText](../../../components/ThemedText.md), [RoutineDetailsStep](RoutineDetailsStep.md),
[RoutineExercisesStep](RoutineExercisesStep.md), [Colors](../../../constants/Colors.md).

## Used by

[RoutinesScreen](../screens/RoutinesScreen.md).

## Tests

none.

## Gotchas / TODO

- The global `alert()` works on native and web but is plain; the buttons are
  already disabled when invalid, so the validation alerts are mostly
  unreachable.
- Its error alert never shows, because storage errors are swallowed upstream
  (see [useAsyncStorage](../../../hooks/useAsyncStorage.md)).
