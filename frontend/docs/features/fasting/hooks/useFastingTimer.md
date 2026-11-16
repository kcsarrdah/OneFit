# `features/fasting/hooks/useFastingTimer.ts`

## Purpose

The running fast: start, stop (hands the finished fast to `onComplete`),
reset. The start time is kept on the device so the timer survives restarts,
and it catches up when the app returns to the foreground.

## Public API

`useFastingTimer({ goalDurationSeconds: number, onComplete: (fast: CompletedFastData) => void })`
returns:

| Field | Type |
|---|---|
| `isActive` | `boolean` |
| `elapsedSeconds` | `number` |
| `remainingSeconds`, `progressPercentage` | from [fastProgress](../lib/format.md) |
| `startTime` | `number \| null` (ms) |
| `startFast()` | no-op if active |
| `stopFast()` | no-op if inactive; computes duration from `Date.now()` and calls `onComplete` |
| `resetTimer()` | clears state and storage |

## How it works

- AsyncStorage key **`fastingTimerState`**: `{ startTime, goalDurationSeconds }`.
  Written while active, removed otherwise.
- On mount (and when the goal changes): if a stored state has the same goal
  and `now - startTime < goal`, resume it; otherwise the stored state is
  removed.
- A 1 s `setInterval` recomputes `elapsed = floor((now - startTime) / 1000)`
  from the wall clock, so it never drifts.
- On returning to `active` from `background`/`inactive` (`AppState`), elapsed
  is recomputed (clamped to the goal until the next tick).
- The fast never stops itself: past the goal it keeps counting
  (progress capped at 100%) until the user completes it.

## Depends on

`@react-native-async-storage/async-storage`, `react-native` `AppState`,
[format](../lib/format.md), [types](../types.md).

## Used by

[FastingScreen](../screens/FastingScreen.md).

## Tests

[useFastingTimer.test](../../../__tests__/features/fasting/hooks/useFastingTimer.test.md).

## Gotchas / TODO

- **A fast that passes its goal while the app is closed is silently lost.**
  On restore, `elapsed >= goal` deletes the stored state instead of resuming.
  This contradicts the in-app behaviour (keep counting past the goal) and
  means the most common case, a 16 h fast overnight, is dropped on relaunch.
  Restore regardless of elapsed time.
- The restore also requires the same goal; once schedules are selectable, a
  changed schedule discards a running fast.
- The foreground handler clamps `elapsedSeconds` to the goal, which briefly
  shows the wrong overtime until the next tick.
