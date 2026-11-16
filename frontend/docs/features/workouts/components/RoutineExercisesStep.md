# `features/workouts/components/RoutineExercisesStep.tsx`

## Purpose

Step 2 of "Create custom routine": the exercises picked so far (tap × to
remove) and the catalogue to add from, searchable and filtered by muscle
group.

## Public API

`RoutineExercisesStep({ selected: Exercise[], onAdd(exercise), onRemove(id), searchQuery, onSearchQuery, muscleGroup: string | null, onMuscleGroup })`.

## How it works

`available = searchExercises(EXERCISES, searchQuery, muscleGroup, selected)`
([routines](../lib/routines.md)), so picked exercises disappear from the
list. Muscle chips are [Badge](../../../components/ui/Badge.md)s (accent when
selected; tapping the selected one clears it). The catalogue list scrolls
inside a 200 px box.

## Depends on

[Badge](../../../components/ui/Badge.md), [Card](../../../components/ui/Card.md),
[Input](../../../components/ui/Input.md), [IconSymbol](../../../components/ui/IconSymbol.md),
[ThemedText](../../../components/ThemedText.md), [routines](../lib/routines.md),
[constants](../constants.md), [Colors](../../../constants/Colors.md).

## Used by

[CreateCustomRoutineModal](CreateCustomRoutineModal.md).

## Tests

none (search is covered by [routines.test](../../../__tests__/features/workouts/lib/routines.test.md)).

## Gotchas / TODO

- Selected exercises cannot be reordered.
- The 200 px list nests a `ScrollView` inside the modal's `ScrollView`;
  on Android the inner one may not scroll without `nestedScrollEnabled`.
- The × and + targets are small (padding 4, icon 16).
