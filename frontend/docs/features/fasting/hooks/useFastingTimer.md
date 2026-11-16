# `features/fasting/hooks/useFastingTimer.ts`

## Purpose

The running fast: start, stop (hands the finished fast to `onComplete` and
clears the timer), reset. The start time is kept on the device so the timer
survives restarts; a fast that reached its goal while the app was closed is
completed on launch. It catches up when the app returns to the foreground.

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
| `stopFast()` | no-op if inactive; computes duration from `Date.now()`, clears the timer (inactive, `startTime` null, 0 elapsed) and calls `onComplete` |
| `resetTimer()` | clears state and storage |

## How it works

- AsyncStorage key **`fastingTimerState`**: `{ startTime, goalDurationSeconds }`.
  Written while active, removed otherwise.
- On mount (and when the goal changes), [restoreFast](../lib/restore.md)
  decides: short of the goal, resume; goal reached while the app was closed,
  remove the key and call `onComplete` with end = start + goal (the screen
  opens the "Fast complete" dialog); a different goal, ignore it.
  `onComplete` is read through a ref so a new callback does not re-run the
  load.
- A 1 s `setInterval` recomputes `elapsed = floor((now - startTime) / 1000)`
  from the wall clock, so it never drifts.
- On returning to `active` from `background`/`inactive` (`AppState`), elapsed
  is recomputed from the wall clock.
- The fast never stops itself: past the goal it keeps counting
  (progress capped at 100%) until the user completes it.

## Depends on

`@react-native-async-storage/async-storage`, `react-native` `AppState`,
[format](../lib/format.md), [restore](../lib/restore.md), [types](../types.md).

## Used by

[FastingScreen](../screens/FastingScreen.md).

## Tests

[useFastingTimer.test](../../../__tests__/features/fasting/hooks/useFastingTimer.test.md).

## Gotchas / TODO

- Two rules for passing the goal: with the app open (or only backgrounded)
  the fast keeps counting until the user completes it; after a relaunch it is
  completed at exactly the goal, since overtime while closed is unknown.
- The restore also requires the same goal; once schedules are selectable, a
  changed schedule discards a running fast.
