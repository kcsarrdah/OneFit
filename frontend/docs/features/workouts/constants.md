# `features/workouts/constants.ts`

## Purpose

The built-in exercise catalogue, the starter routines, and the option lists
the workout screens filter by.

## Public API

| Export | Value |
|---|---|
| `MUSCLE_GROUPS` | Chest, Back, Shoulders, Arms, Legs, Core |
| `ROUTINE_DIFFICULTIES` | Beginner, Intermediate, Advanced |
| `ROUTINE_CATEGORIES` | Full Body, Upper Body, Lower Body, Strength, Cardio, HIIT (form order) |
| `ROUTINE_FILTERS` | `'All'` + `ROUTINE_CATEGORIES` (Routines screen chips) |
| `EXERCISES` | 22 exercises: Chest 5, Back 4, Shoulders 3, Arms 3, Legs 4, Core 3, with ids such as `bench-press`, `squat`, `plank` and their equipment |
| `WORKOUT_ROUTINES` | 5 starters: Beginner Full Body (45 min), Upper Body Strength (60), Leg Day Crusher (50), Quick HIIT (20), Chest Focus (40) |

## How it works

Routines reference exercises with `EXERCISES.find(e => e.id === ...)!`.

## Depends on

[types](types.md).

## Used by

[WorkoutScreen](screens/WorkoutScreen.md), [PickNext](components/PickNext.md),
[RoutinesScreen](screens/RoutinesScreen.md), [RoutineDetailsStep](components/RoutineDetailsStep.md),
[RoutineExercisesStep](components/RoutineExercisesStep.md), [ExerciseSelectionModal](components/ExerciseSelectionModal.md),
[useCustomRoutines](hooks/useCustomRoutines.md); tests.

## Tests

Used as fixtures by [setLogging.test](../../__tests__/features/workouts/lib/setLogging.test.md)
and [routines.test](../../__tests__/features/workouts/lib/routines.test.md).

## Gotchas / TODO

- Exercise ids are stored inside saved workouts and custom routines; renaming
  an id orphans its history ("last time" lookups match by id).
- Changing a starter routine does not update copies or sessions already
  started from it (they store full `Exercise` objects).
- No Cardio routine and no cardio exercises exist, though `Cardio` is a
  category.
- The backend has its own exercises table (`/api/exercises`); nothing maps
  these string ids to it yet.
