# `hooks/useAsyncStorage.ts`

## Purpose

A thin JSON wrapper around AsyncStorage with loading and error state.

## Public API

`useAsyncStorage()` returns:

| Field | Signature |
|---|---|
| `getItem` | `<T>(key) => Promise<T \| null>` (null when missing or on error) |
| `setItem` | `<T>(key, value) => Promise<void>` |
| `removeItem` | `(key) => Promise<void>` |
| `clear` | `() => Promise<void>` (wipes **all** app storage) |
| `getMultiple` | `<T>(keys) => Promise<Record<string, T \| null>>` |
| `setMultiple` | `<T>(items: Record<string, T>) => Promise<void>` |
| `isLoading` | `boolean` (last call in flight) |
| `error` | `Error \| null` (last failure) |

## How it works

Values are `JSON.stringify`/`JSON.parse`d. Every function is a stable
`useCallback` with no deps, so it is safe in effect dependency arrays. Errors
are caught, logged with `console.error`, stored in `error`, and swallowed.

## Depends on

`@react-native-async-storage/async-storage`.

## Used by

[useWorkoutSession](../features/workouts/hooks/useWorkoutSession.md),
[useWorkoutHistory](../features/workouts/hooks/useWorkoutHistory.md),
[useCustomRoutines](../features/workouts/hooks/useCustomRoutines.md),
[useWeightUnit](../features/workouts/hooks/useWeightUnit.md).
(Fasting, water and the theme call AsyncStorage directly.)

## Tests

none directly.

## Gotchas / TODO

- Because errors are swallowed, callers' `try/catch` blocks never see a
  storage failure (e.g. `useCustomRoutines.saveCustomRoutines` updates state
  even when the write failed, and its `throw` path is unreachable).
- A falsy stored string (`""`) reads back as `null`.
- Lint: unused `useEffect` import.
