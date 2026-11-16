# `features/water/components/ResetIntake.tsx`

## Purpose

A quiet "Reset" text button for today's water that asks before setting it
back to 0 ml.

## Public API

`ResetIntake({ intake: number, onReset: () => void })`. Renders nothing while
`intake` is 0.

## How it works

A 44 pt muted text button opens a [ConfirmDialog](../../../components/ui/ConfirmDialog.md)
("Reset water intake?", "Today's 1,250ml goes back to 0ml."); confirming
closes it and calls `onReset`.

## Depends on

[ConfirmDialog](../../../components/ui/ConfirmDialog.md), [Colors](../../../constants/Colors.md).

## Used by

[WaterScreen](../screens/WaterScreen.md).

## Tests

none.

## Gotchas / TODO

none.
