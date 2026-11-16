# `features/water/components/HydrationActions.tsx`

## Purpose

The round "+250ml" drop button and, once something is logged, a Reset button
that asks for confirmation first.

## Public API

`HydrationActions({ intake: number, logAmount: number, onLog: () => void, onReset: () => void })`.

## How it works

An absolutely positioned row 140 px from the bottom (above the tab bar): an
80 px round [Button](../../../components/ui/Button.md) with a `drop.fill` icon
in water blue and a "+250ml" caption; when `intake > 0`, a 60 px destructive
Reset button whose press shows `Alert.alert` (Cancel / Reset).

## Depends on

[Button](../../../components/ui/Button.md), [IconSymbol](../../../components/ui/IconSymbol.md),
[Colors](../../../constants/Colors.md) (`WaterColors`), `react-native` `Alert`.

## Used by

[WaterScreen](../screens/WaterScreen.md).

## Tests

none.

## Gotchas / TODO

- **Reset does nothing on web**: React Native Web's `Alert.alert` is a no-op,
  so the confirmation never appears and `onReset` never runs. Use a
  [Dialog](../../../components/ui/Dialog.md) (or `window.confirm` on web).
- No haptic on log, unlike the workout controls.
