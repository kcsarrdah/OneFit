# `features/fasting/lib/restore.ts`

## Purpose

What to do with a fast found on the device at launch: resume it, complete it
because it reached its goal while the app was closed, or ignore it.

## Public API

| Export | Signature | Does |
|---|---|---|
| `StoredTimer` | `{ startTime: number; goalDurationSeconds: number }` | The `fastingTimerState` value |
| `RestoredFast` | `{ kind: 'resume'; startTime; elapsedSeconds } \| { kind: 'complete'; fast: CompletedFastData } \| { kind: 'none' }` | |
| `restoreFast` | `(stored: StoredTimer \| null, goalDurationSeconds, now: number) => RestoredFast` | See below |

## How it works

- Nothing stored, or stored under a different goal: `none`.
- `elapsed = floor((now - startTime) / 1000)` below the goal: `resume`.
- Otherwise `complete`, with `endTime = startTime + goal` and
  `actualDurationSeconds = goal`: the time after the goal while the app was
  closed is not counted, since nobody was there to end the fast.

## Depends on

[types](../types.md).

## Used by

[useFastingTimer](../hooks/useFastingTimer.md).

## Tests

[restore.test](../../../__tests__/features/fasting/lib/restore.test.md).

## Gotchas / TODO

A changed goal still discards a running fast (`none`); once schedules are
selectable, store and honour the fast's own goal.
