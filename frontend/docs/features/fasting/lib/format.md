# `features/fasting/lib/format.ts`

## Purpose

Pure formatting and progress helpers for the fasting timer.

## Public API

| Export | Signature | Example |
|---|---|---|
| `formatFastLength` | `(seconds) => string` | `"16h"`, `"16h 5m"`, `"45m"` (takeover, confirm, toast) |
| `formatHoursClock` | `(seconds) => string` | `"16:00"`, `"7:42"`, `"0:05"`: the ring's big number; negative counts as 0 |
| `formatDayTime` | `(ms \| null) => string` | `"Tue 12:30 PM"` (en-US), or `"Now"` |
| `expectedEnd` | `(startMs \| null, goalSeconds) => number \| null` | start + goal |
| `fastProgress` | `(elapsed, goal) => { progressPercentage, remainingSeconds }` | 0..100 (0 for a zero goal), remaining never negative |

## How it works

No state; `Math.floor` throughout.

## Depends on

nothing.

## Used by

[FastingScreen](../screens/FastingScreen.md), [useFastingTimer](../hooks/useFastingTimer.md),
[useFastCompletion](../hooks/useFastCompletion.md), [FastComplete](../components/FastComplete.md).

## Tests

[format.test](../../../__tests__/features/fasting/lib/format.test.md).

## Gotchas / TODO

`formatDayTime` treats `0` as no time ("Now", falsy check).
