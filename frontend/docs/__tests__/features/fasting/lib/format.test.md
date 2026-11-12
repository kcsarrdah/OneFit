# `__tests__/features/fasting/lib/format.test.ts`

## Purpose

Unit tests for [format](../../../../features/fasting/lib/format.md). 11 tests.

## Public API

| `describe` | Tests | Covers |
|---|---|---|
| `formatTime` | 3 | MM:SS under an hour, HH:MM:SS from an hour, negative as zero |
| `formatHoursMinutes / formatFastLength` | 2 | Dialog keeps "0m"; toast drops it |
| `formatClock / expectedEnd` | 3 | "Not started"; start + goal; month, day and time format |
| `fastProgress` | 3 | Percent and seconds left; capped at 100% and 0 left; 0% for a zero goal |

## How it works

Pure functions, no mocks.

## Depends on

`@/features/fasting/lib/format`.

## Used by

`npx jest`.

## Tests

This is a test file.

## Gotchas / TODO

`formatClock` output depends on the machine's time zone; the test is written
to tolerate that.
