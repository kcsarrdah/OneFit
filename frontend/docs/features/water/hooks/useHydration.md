# `features/water/hooks/useHydration.ts`

## Purpose

Today's water intake, the daily goal and the amount one tap logs, kept on the
device. A new day starts from 0; every change is also written to the 30-day
history.

## Public API

`useHydration()` returns `{ dailyGoal, intake, logAmount, isLoaded, logWater(), resetWater() }`.
`logWater` adds `logAmount`; `resetWater` sets intake to 0.

## How it works

- Keys from [constants](../constants.md) (`aquaViz_*`).
- Load once: goal and log amount (or defaults); if `intakeDate` is today
  ([dayKey](../lib/hydration.md)) restore `currentIntake`, else write 0, today's
  date and a 0 history entry.
- After load, every change to `intake` or `dailyGoal` writes `currentIntake`
  and upserts today's history entry.

## Depends on

`@react-native-async-storage/async-storage`, [hydration](../lib/hydration.md),
[constants](../constants.md).

## Used by

[WaterScreen](../screens/WaterScreen.md).

## Tests

none (pure parts: [hydration.test](../../../__tests__/features/water/lib/hydration.test.md)).

## Gotchas / TODO

- **Day rollover only happens on mount.** If the app stays open past the
  (UTC) day boundary, intake keeps adding to yesterday's total, and the save
  effect writes that total into the new day's history entry, while
  `intakeDate` stays on the old day.
- No undo of a single log, only reset.
- No setters for goal or log amount.
