# `features/workouts/types.ts`

## Purpose

Shared workout types: the exercise catalogue, a session's sets, routines and
saved workouts.

## Public API

| Type | Shape |
|---|---|
| `MuscleGroup` | `'Chest' \| 'Back' \| 'Shoulders' \| 'Arms' \| 'Legs' \| 'Core'` |
| `Equipment` | `'Barbell' \| 'Dumbbells' \| 'Machine' \| 'Cable' \| 'Bodyweight'` |
| `WeightUnit` | `'kg' \| 'lbs'` |
| `RoutineDifficulty` | `'Beginner' \| 'Intermediate' \| 'Advanced'` |
| `RoutineCategory` | `'Strength' \| 'Cardio' \| 'HIIT' \| 'Full Body' \| 'Upper Body' \| 'Lower Body'` |
| `Exercise` | `{ id, name, muscleGroup, equipment?, instructions? }` |
| `WorkoutSet` | `{ id, reps, weight, completed }` |
| `WorkoutExercise` | `{ id, exercise: Exercise, sets: WorkoutSet[], notes? }`: one exercise in a session |
| `WorkoutRoutine` | `{ id, name, description, exercises, estimatedDuration (min), difficulty, category }` |
| `CustomRoutine` | `WorkoutRoutine & { isCustom, createdAt, updatedAt }` (ISO strings) |
| `NewRoutine` | the form's fields: `WorkoutRoutine` without `id` |
| `SavedWorkout` | `{ id, name, date (ISO), exercises, duration (s), notes?, totalSets, completedSets, totalVolume, weightUnit }` |

## How it works

Types only. Saved data in AsyncStorage has these shapes, so changing them
needs a migration or a tolerant reader.

## Depends on

nothing.

## Used by

Everything in `features/workouts/`, and the workout tests.

## Tests

Type-checked by `tsc`.

## Gotchas / TODO

- `WorkoutSet.weight` is in the workout's unit (`SavedWorkout.weightUnit`),
  not normalised. Switching units does not convert history.
- The backend's workout models differ (weights in kg, its own ids; see
  `backend/docs/models/workout_session.md`); nothing maps between them yet.
