# `features/workouts/components/ExerciseSelectionModal.tsx`

## Purpose

A dialog to browse the exercise catalogue, searchable and filtered by muscle
group; tapping an exercise picks it and closes.

## Public API

`ExerciseSelectionModal({ visible, onClose, onSelectExercise: (exercise: Exercise) => void })`.

## How it works

Local search text and muscle group; list from
[searchExercises](../lib/routines.md). "Clear Filters" appears when either is
set; a footer counts results.

## Depends on

[Dialog](../../../components/ui/Dialog.md), [Button](../../../components/ui/Button.md),
[Input](../../../components/ui/Input.md), [Card](../../../components/ui/Card.md),
[ThemedText](../../../components/ThemedText.md), [routines](../lib/routines.md),
[constants](../constants.md), [Colors](../../../constants/Colors.md).

## Used by

Nothing ("Not used by any screen yet", per its header).

## Tests

none.

## Gotchas / TODO

Unused; the swipe-to-log flow picks exercises in [PickNext](PickNext.md).
Either turn it into [ExercisesScreen](../screens/ExercisesScreen.md) or delete
it.
