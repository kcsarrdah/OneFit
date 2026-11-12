# `features/fasting/lib/format.ts`

## Purpose

Pure formatting and progress helpers for the fasting timer.

## Public API

| Export | Signature | Example |
|---|---|---|
| `formatTime` | `(seconds) => string` | `"05:09"`, `"16:00:00"`; negative counts as 0 |
| `formatHoursMinutes` | `(seconds) => string` | `"16h 0m"`, `"45m"` (dialog) |
| `formatFastLength` | `(seconds) => string` | `"16h"`, `"16h 5m"`, `"45m"` (toast) |
| `formatClock` | `(ms \| null) => string` | `"Nov 12, 9:30 PM"` (en-US), or `"Not started"` |
| `expectedEnd` | `(startMs \| null, goalSeconds) => number \| null` | start + goal |
| `fastProgress` | `(elapsed, goal) => { progressPercentage, remainingSeconds }` | 0..100 (0 for a zero goal), remaining never negative |

## How it works

No state; `Math.floor` throughout.

## Depends on

nothing.

## Used by

[FastingScreen](../screens/FastingScreen.md), [useFastingTimer](../hooks/useFastingTimer.md),
[useFastCompletion](../hooks/useFastCompletion.md), [FastCompleteDialog](../components/FastCompleteDialog.md).

## Tests

[format.test](../../../__tests__/features/fasting/lib/format.test.md).

## Gotchas / TODO

`formatClock` treats `0` as "not started" (falsy check).
