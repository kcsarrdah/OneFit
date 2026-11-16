# `components/ui/ScreenTitle.tsx`

## Purpose

A screen's title in the display voice: Oswald SemiBold, uppercase, 40/46 pt,
chalk. One per screen, at the top, with no label above it ("no eyebrows").

## Public API

`ScreenTitle({ children: string, style?: StyleProp<TextStyle> })`. Renders a
`Text` with `accessibilityRole="header"`.

## How it works

Fixed style from [Fonts](../../constants/Fonts.md) and [Colors](../../constants/Colors.md).

## Depends on

[Colors](../../constants/Colors.md), [Fonts](../../constants/Fonts.md).

## Used by

[FastingScreen](../../features/fasting/screens/FastingScreen.md),
[WaterScreen](../../features/water/screens/WaterScreen.md),
[RoutinesScreen](../../features/workouts/screens/RoutinesScreen.md),
[HistoryScreen](../../features/workouts/screens/HistoryScreen.md).

## Tests

none.

## Gotchas / TODO

[PickNext](../../features/workouts/components/PickNext.md) still styles its
"What's next?" title inline with the same values.
