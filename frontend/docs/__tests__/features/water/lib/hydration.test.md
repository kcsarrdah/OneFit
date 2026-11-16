# `__tests__/features/water/lib/hydration.test.ts`

## Purpose

Unit tests for [hydration](../../../../features/water/lib/hydration.md). 16 tests.

## Public API

| `describe` | Tests | Covers |
|---|---|---|
| `dayKey` | 2 | Local calendar day at 23:30 and 00:05; zero-padding |
| `utcDayKey` | 1 | UTC calendar day (23:30Z stays on that date) |
| `rollover and addIntake` | 2 | Same day keeps and adds; a new day starts from 0 |
| `migrateToLocalDays` | 4 | No change when the days agree; an older stored day is left alone; nothing stored; today's UTC key and history entry move to the local day (older entries kept, input not mutated) |
| `fillFraction` | 3 | Intake over goal; capped at 1; 0 for no goal or negative intake |
| `remaining` | 1 | Never below zero |
| `upsertHistory` | 3 | Replaces the same day, newest first; adds a new day; keeps at most `HISTORY_LIMIT` |

## How it works

Pure functions, no mocks. Local times use `new Date(y, m, d, h)` so the
suite holds in any time zone. The "moves today's UTC key" test needs a
moment whose UTC and local days differ; it is skipped when Jest runs in UTC.

## Depends on

`@/features/water/lib/hydration`.

## Used by

`npx jest`.

## Tests

This is a test file.

## Gotchas / TODO

Run with `TZ=America/New_York` or `TZ=Asia/Kolkata` to exercise the
migration test (checked on both). The hook is covered in
[useHydration.test](../hooks/useHydration.test.md);
[WaterFill](../../../../features/water/components/WaterFill.md) is not.
