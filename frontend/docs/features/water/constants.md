# `features/water/constants.ts`

## Purpose

Water tracker defaults and the AsyncStorage keys it uses.

## Public API

- `DEFAULT_GOAL = 2000` (ml), `DEFAULT_LOG_AMOUNT = 250` (ml).
- `WATER_STORAGE_KEYS`: `dailyGoal` `aquaViz_dailyGoal`, `defaultLogAmount`
  `aquaViz_defaultLogAmount`, `currentIntake` `aquaViz_currentIntake`,
  `intakeDate` `aquaViz_intakeDate`, `history` `aquaViz_hydrationHistory`,
  `dayKeys` `aquaViz_dayKeys` (`'local'` once the UTC-to-local day key
  migration has run).

## How it works

The `aquaViz_` prefix is a legacy name; changing it would orphan data already
stored on devices.

## Depends on

nothing.

## Used by

[useHydration](hooks/useHydration.md).

## Tests

none.

## Gotchas / TODO

`dailyGoal` and `defaultLogAmount` are read but nothing writes them; there is
no settings UI, so the defaults always apply.
