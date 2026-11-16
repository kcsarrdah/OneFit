# `features/workouts/components/StatColumn.tsx`

## Purpose

A bold number over a small label, centred. Used in rows of stats on routine
and history cards.

## Public API

`StatColumn({ value: ReactNode, label: string, valueColor: string, labelColor: string, size?: 'sm' | 'md' | 'lg' = 'md' })`.
Value font 14 / 16 / 24; `lg` columns take `flex: 1` so they share the row.

## How it works

Two [ThemedText](../../../components/ThemedText.md)s.

## Depends on

[ThemedText](../../../components/ThemedText.md).

## Used by

[RoutineCard](RoutineCard.md) (`md`), [WorkoutHistoryCard](WorkoutHistoryCard.md) (`sm`),
[HistoryScreen](../screens/HistoryScreen.md) (`lg`).

## Tests

none.

## Gotchas / TODO

none.
