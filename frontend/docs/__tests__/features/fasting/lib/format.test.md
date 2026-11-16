# `__tests__/features/fasting/lib/format.test.ts`

## Purpose

Unit tests for [format](../../../../features/fasting/lib/format.md). 11 tests.

## Public API

| `describe` | Tests | Covers |
|---|---|---|
| `formatHoursClock` | 2 | H:MM for hours and minutes; negative as zero |
| `formatFastLength` | 1 | Drops "0m" |
| `formatDayTime / expectedEnd` | 3 | "Now" without a time; start + goal; weekday and time format |
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

`formatDayTime` output depends on the machine's time zone; the test is written
to tolerate that.
