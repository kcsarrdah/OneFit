# `features/workouts/hooks/useCustomRoutines.ts`

## Purpose

The built-in routines plus the user's own, stored on the device: create,
duplicate and delete custom routines.

## Public API

`useCustomRoutines()` returns `{ routines: AnyRoutine[], isLoading, createCustomRoutine(fields: NewRoutine), duplicateRoutine(routine), deleteCustomRoutine(id) }`.
The three actions return `Promise<void>`.

## How it works

- AsyncStorage key **`custom-routines`**: `CustomRoutine[]`.
- `routines = allRoutines(WORKOUT_ROUTINES, customRoutines)` (built-ins
  first), memoised.
- Each action writes the new array, then sets state.

## Depends on

[useAsyncStorage](../../../hooks/useAsyncStorage.md), [routines](../lib/routines.md),
[constants](../constants.md), [types](../types.md).

## Used by

[RoutinesScreen](../screens/RoutinesScreen.md).

## Tests

none (pure parts: [routines.test](../../../__tests__/features/workouts/lib/routines.test.md)).

## Gotchas / TODO

- No edit action; a custom routine can only be duplicated or deleted.
- `saveCustomRoutines` rethrows errors, but `useAsyncStorage.setItem` never
  throws, so callers' `.catch` handlers never run.
- No undo after deleting (the [RoutineCard](../components/RoutineCard.md) asks
  for confirmation first).
