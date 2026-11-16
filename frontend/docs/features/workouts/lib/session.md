# `features/workouts/lib/session.ts`

## Purpose

Pure helpers for the workout in progress: entries from a routine, logging and
undoing sets, counting what was logged.

## Public API

| Export | Signature | Does |
|---|---|---|
| `ROUTINE_DEFAULT_SET` | `{ weight: 20, reps: 8 }` | Placeholder set values |
| `routineEntries` | `(exercises, now = Date.now()) => WorkoutExercise[]` | One entry per exercise, each with 3 placeholder sets, `completed: false` |
| `withLoggedSet` | `(entries, entryId, weight, reps) => WorkoutExercise[]` | Appends a completed set to one entry |
| `withoutLastSet` | `(entries, entryId) => WorkoutExercise[]` | Drops that entry's last set |
| `setsLogged` | `(entries) => number` | Completed sets across the session |

## How it works

Immutable updates. Ids: entries `${now + index}_${Math.random()}`, sets
`set_${baseTime}_${n}` or `set_${Date.now()}_${Math.random()}`.

## Depends on

[types](../types.md).

## Used by

[useWorkoutSession](../hooks/useWorkoutSession.md), [WorkoutScreen](../screens/WorkoutScreen.md).

## Tests

[session.test](../../../__tests__/features/workouts/lib/session.test.md).

## Gotchas / TODO

- Placeholder sets are never shown or completed by the swipe-to-log flow;
  they are filtered out everywhere (`completed: false`) and dropped on save by
  `completedOnly`. They are leftovers from the old set-table UI.
- `withoutLastSet` removes the last set regardless of `completed`; on an
  entry with only placeholders it would remove a placeholder. The UI only
  calls it right after logging, so the last set is the logged one.
