# `features/workouts/hooks/useWeightUnit.ts`

## Purpose

The user's weight unit (kg or lbs), kept on the device. Defaults to kg.

## Public API

`useWeightUnit()` returns `{ weightUnit: WeightUnit, setWeightUnit(unit) }`.

## How it works

AsyncStorage key **`workout_weight_unit`** (JSON string `"kg"`/`"lbs"`). Read
once on mount; `setWeightUnit` updates state and writes (fire and forget).

## Depends on

[useAsyncStorage](../../../hooks/useAsyncStorage.md), [types](../types.md).

## Used by

[WorkoutScreen](../screens/WorkoutScreen.md) (only reads it).

## Tests

none.

## Gotchas / TODO

No screen calls `setWeightUnit`, so the unit is always kg unless storage was
set by an older build. There is no settings UI yet.
