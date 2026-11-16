# `features/water/hooks/useHydration.ts`

## Purpose

Today's water intake, the daily goal and the amount one tap logs, kept on the
device. A new local day starts from 0, also when the app stays open past
midnight; every change is also written to the 30-day history.

## Public API

`useHydration()` returns `{ dailyGoal, intake, logAmount, isLoaded, logWater(), resetWater() }`.
`logWater` adds `logAmount` (to a fresh day if the date changed); `resetWater`
sets today's intake to 0.

## How it works

- Keys from [constants](../constants.md) (`aquaViz_*`).
- State is a `DayTally` `{ day, intake }` ([hydration](../lib/hydration.md)),
  so the intake always knows which local day it counts for.
- Load once: goal and log amount (or defaults). Then, once per device,
  `migrateDayKeys` moves UTC day keys to local ones
  ([migrateToLocalDays](../lib/hydration.md)) and sets `aquaViz_dayKeys` to
  `'local'`. The stored intake is restored only if its day is today
  ([rollover](../lib/hydration.md)); otherwise the day starts at 0.
- Rollover past midnight: `logWater` uses [addIntake](../lib/hydration.md),
  which starts a new day when `dayKey()` has moved on, and an `AppState`
  listener rolls over when the app returns to the foreground.
- After load, every change to the tally or `dailyGoal` writes
  `currentIntake`, `intakeDate` and upserts that day's history entry. Saves
  run through a promise queue (`saveQueue` ref) so two quick changes cannot
  interleave their history read-modify-write (which would lose the previous
  day's entry at rollover).

## Depends on

`@react-native-async-storage/async-storage`, `react-native` `AppState`,
[hydration](../lib/hydration.md), [constants](../constants.md).

## Used by

[WaterScreen](../screens/WaterScreen.md).

## Tests

[useHydration.test](../../../__tests__/features/water/hooks/useHydration.test.md);
pure parts in [hydration.test](../../../__tests__/features/water/lib/hydration.test.md).

## Gotchas / TODO

- With the app open in the foreground over midnight and no tap, the screen
  shows yesterday's total until the next log or foreground return.
- No undo of a single log, only reset.
- No setters for goal or log amount.
