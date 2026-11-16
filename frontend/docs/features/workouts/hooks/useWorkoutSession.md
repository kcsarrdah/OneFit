# `features/workouts/hooks/useWorkoutSession.ts`

## Purpose

The workout in progress: its exercises and sets, saved on the device after
every change so nothing is lost if the app closes.

## Public API

`useWorkoutSession()` returns:

| Field | Type | Meaning |
|---|---|---|
| `exercises` | `WorkoutExercise[]` | Session entries |
| `startTime` | `string` (ISO) | When this session began (see gotchas) |
| `isLoading` | `boolean` | Until the stored session is read |
| `addExercisesFromRoutine(exercises)` | | Appends [routineEntries](../lib/session.md) (3 placeholder sets each) |
| `startExercise(exercise) => string` | | Returns the entry id; reuses an existing entry for the same exercise, else adds one with no sets |
| `logSet(entryId, weight, reps)` | | Appends a completed set |
| `removeLastSet(entryId)` | | Undo |
| `resetSession() => Promise<void>` | | Empty session, new id and start time, storage key removed |

## How it works

- AsyncStorage key **`workout_current_session`**:
  `{ exercises, sessionId, startTime, lastUpdated }`.
- Loads once on mount; with nothing stored, a new `sessionId` and `startTime`
  are made (in memory).
- Auto-saves whenever `exercises` changes, once loaded and only while
  `exercises.length > 0`.

## Depends on

[useAsyncStorage](../../../hooks/useAsyncStorage.md), [session](../lib/session.md), [types](../types.md).

## Used by

[WorkoutsTab](../screens/WorkoutsTab.md) (owns it so a routine started on the
Routines screen carries over), passed to [WorkoutScreen](../screens/WorkoutScreen.md).

## Tests

none (its pure parts: [session.test](../../../__tests__/features/workouts/lib/session.test.md)).

## Gotchas / TODO

- **Duration is measured from the wrong moment.** `startTime` is set when the
  session object is created (app open with no stored session, or the previous
  workout's Finish), not at the first logged set. Finish one workout tonight,
  start the next tomorrow without restarting the app, and the saved duration
  spans both days. A stored session from days ago is also resumed as is,
  sets and all. Set `startTime` on the first `startExercise`/`logSet`
  instead, and consider expiring stale sessions.
- `sessionId` is stored but never read.
- `startExercise` reads `exercises` from the closure; two quick calls in the
  same render could add the same exercise twice.
