# `features/water/lib/hydration.ts`

## Purpose

Pure helpers for the water tracker: the day key intake is stored under, how
full the glass is, and the 30-day history.

## Public API

| Export | Signature | Does |
|---|---|---|
| `HistoryEntry` | `{ date: string; intake: number; goal: number }` | |
| `HISTORY_LIMIT` | `30` | Days kept |
| `dayKey` | `(date = new Date()) => string` | `"YYYY-MM-DD"` in **UTC** |
| `fillFraction` | `(intake, goal) => number` | 0..1; 0 for goal <= 0 |
| `remaining` | `(intake, goal) => number` | ml left, never negative |
| `upsertHistory` | `(history, entry) => HistoryEntry[]` | Replace that day (or add), newest first, at most 30; does not mutate |

## How it works

Pure functions.

## Depends on

nothing.

## Used by

[useHydration](../hooks/useHydration.md), [WaterScreen](../screens/WaterScreen.md).

## Tests

[hydration.test](../../../__tests__/features/water/lib/hydration.test.md).

## Gotchas / TODO

`dayKey` is the UTC date ("as stored so far"), so the day rolls over at UTC
midnight, not local midnight (e.g. 19:00 in New York, 05:30 in India).
Switching to local dates needs a migration for stored `intakeDate` and
history.
