# `components/ui/Input.tsx`

## Purpose

The shared single-line text field.

## Public API

`Input` (forwardRef to `TextInput`): all `TextInputProps` except `style`, plus
`containerStyle?: ViewStyle`, `inputStyle?: TextStyle`, `error?: boolean`
(destructive border).

## How it works

40 px high, radius 6, 1 px `border`, `background` fill, `text` colour,
placeholder in `tabIconDefault`. `editable={false}` halves opacity. The
wrapper is full width.

## Depends on

[useThemeColor](../../hooks/useThemeColor.md).

## Used by

[PickNext](../../features/workouts/components/PickNext.md) (search, restyled to a 52 px pill),
[RoutineDetailsStep](../../features/workouts/components/RoutineDetailsStep.md),
[RoutineExercisesStep](../../features/workouts/components/RoutineExercisesStep.md),
[ExerciseSelectionModal](../../features/workouts/components/ExerciseSelectionModal.md).

## Tests

none.

## Gotchas / TODO

Empty `Platform.select` blocks in the styles. No label or error text; pair
with your own.
