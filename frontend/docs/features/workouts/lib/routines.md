# `features/workouts/lib/routines.ts`

## Purpose

Pure helpers for routines: list built-in and custom ones together, filter by
category, build new custom routines, search the exercise catalogue.

## Public API

| Export | Signature | Does |
|---|---|---|
| `AnyRoutine` | `WorkoutRoutine \| CustomRoutine` | |
| `isCustomRoutine` | `(r) => r is CustomRoutine` | `'isCustom' in r && r.isCustom` |
| `allRoutines` | `(builtIn, custom) => AnyRoutine[]` | Built-ins (marked `isCustom: false`) then custom |
| `filterRoutines` | `<T>(routines, 'All' \| RoutineCategory) => T[]` | |
| `createRoutine` | `(fields: NewRoutine, now = new Date()) => CustomRoutine` | id `custom-<ms>`, `isCustom`, `createdAt`/`updatedAt` |
| `duplicateOf` | `(routine, now = new Date()) => CustomRoutine` | Copy named `"<name> (Copy)"` with a new id |
| `searchExercises` | `(catalog, query, muscleGroup \| null, exclude = []) => Exercise[]` | Name contains query (case-insensitive), in the group, not in `exclude` |

## How it works

Pure; `now` is injectable for tests.

## Depends on

[types](../types.md).

## Used by

[useCustomRoutines](../hooks/useCustomRoutines.md), [RoutinesScreen](../screens/RoutinesScreen.md),
[RoutineCard](../components/RoutineCard.md), [RoutineExercisesStep](../components/RoutineExercisesStep.md),
[ExerciseSelectionModal](../components/ExerciseSelectionModal.md).

## Tests

[routines.test](../../../__tests__/features/workouts/lib/routines.test.md).

## Gotchas / TODO

Ids are `custom-<ms>`: two routines created in the same millisecond would
collide (unlikely from the UI).
