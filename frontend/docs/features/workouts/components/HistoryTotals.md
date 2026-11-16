# `features/workouts/components/HistoryTotals.tsx`

## Purpose

The History screen's totals: workouts, minutes and volume as three big chalk
Oswald numbers with a muted word under each. Status, so no accent and no card.

## Public API

`HistoryTotals({ stats: OverallStats, weightUnit: WeightUnit })`.

## How it works

Three equal columns. Values through `formatCompact` (minutes =
`totalDuration / 60`), labels "workout(s)", "minutes", "<unit> lifted".
Each column is one accessible element ("24.3k kg lifted").

## Depends on

[history](../lib/history.md), [types](../types.md), [Colors](../../../constants/Colors.md),
[Fonts](../../../constants/Fonts.md).

## Used by

[HistoryScreen](../screens/HistoryScreen.md).

## Tests

The formatting: [history.test](../../../__tests__/features/workouts/lib/history.test.md). The component: none.

## Gotchas / TODO

Volume sums every workout's `totalVolume` whatever its unit; the label uses
the current [weight unit](../hooks/useWeightUnit.md).
