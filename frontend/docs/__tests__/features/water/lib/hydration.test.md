# `__tests__/features/water/lib/hydration.test.ts`

## Purpose

Unit tests for [hydration](../../../../features/water/lib/hydration.md). 8 tests.

## Public API

| `describe` | Tests | Covers |
|---|---|---|
| `dayKey` | 1 | UTC calendar day (23:30Z stays on that date) |
| `fillFraction` | 3 | Intake over goal; capped at 1; 0 for no goal or negative intake |
| `remaining` | 1 | Never below zero |
| `upsertHistory` | 3 | Replaces the same day, newest first; adds a new day; keeps at most `HISTORY_LIMIT` |

## How it works

Pure functions, no mocks.

## Depends on

`@/features/water/lib/hydration`.

## Used by

`npx jest`.

## Tests

This is a test file.

## Gotchas / TODO

Not covered: the hook [useHydration](../../../../features/water/hooks/useHydration.md)
(new-day reset, persistence) or [WaterFill](../../../../features/water/components/WaterFill.md).
The `dayKey` test pins the UTC behaviour that is itself a known issue.
