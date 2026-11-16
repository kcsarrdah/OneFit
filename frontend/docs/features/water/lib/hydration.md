# `features/water/lib/hydration.ts`

## Purpose

Pure helpers for the water tracker: the local day key intake is stored under
(and the move from the old UTC keys), the day rollover, how full the glass is,
and the 30-day history.

## Public API

| Export | Signature | Does |
|---|---|---|
| `HistoryEntry` | `{ date: string; intake: number; goal: number }` | |
| `HISTORY_LIMIT` | `30` | Days kept |
| `dayKey` | `(date = new Date()) => string` | `"YYYY-MM-DD"` of the **local** calendar day |
| `utcDayKey` | `(date = new Date()) => string` | `"YYYY-MM-DD"` in UTC, how days were keyed before |
| `DayTally` | `{ day: string; intake: number }` | Today's total and its day |
| `rollover` | `(tally, today) => DayTally` | Same object on the same day, `{ today, 0 }` on a new one |
| `addIntake` | `(tally, today, amount) => DayTally` | Rollover, then add `amount` |
| `migrateToLocalDays` | `(storedDate, history, now = new Date()) => { intakeDate, history }` | See below; does not mutate |
| `fillFraction` | `(intake, goal) => number` | 0..1; 0 for goal <= 0 |
| `remaining` | `(intake, goal) => number` | ml left, never negative |
| `upsertHistory` | `(history, entry) => HistoryEntry[]` | Replace that day (or add), newest first, at most 30; does not mutate |

## How it works

`migrateToLocalDays`: only the current day can be matched for sure. If the
stored `intakeDate` is today in UTC and that differs from today locally, it
and its history entry are relabelled with the local day (replacing any entry
already under that local key), so the intake on screen keeps counting after
the update. Anything else is returned unchanged.

## Depends on

nothing.

## Used by

[useHydration](../hooks/useHydration.md), [WaterScreen](../screens/WaterScreen.md).

## Tests

[hydration.test](../../../__tests__/features/water/lib/hydration.test.md).

## Gotchas / TODO

Older history entries keep their UTC dates; each may be a day off from the
local day it was drunk on. Where the UTC and local days differ at the moment
of migration, an entry already under the local key is overwritten by the
current day's.
