# `components/ui/ActionButton.tsx`

## Purpose

A screen's one primary action: a 64 pt accent pill with an Oswald uppercase
label, placed at the bottom within thumb reach. `inverted` is the version for
the accent flood: near-black fill, orange label.

## Public API

`ActionButton({ label, onPress, inverted?, disabled?, accessibilityLabel?, style? })`

| Prop | Type | Meaning |
|---|---|---|
| `label` | `string` | shown uppercase |
| `onPress` | `() => void` | |
| `inverted` | `boolean = false` | near-black fill, accent label (on the orange flood) |
| `disabled` | `boolean = false` | half opacity, no presses |
| `accessibilityLabel` | `string?` | defaults to `label` |
| `style` | `StyleProp<ViewStyle>` | position it (screens use `position: 'absolute'`, `left: contentInset`, `right: 20`, `bottom: insets.bottom + 84`) |

## How it works

A `Pressable` with radius 28; pressed = 0.85 opacity and 0.98 scale. Medium
haptic on iOS before `onPress`.

## Depends on

[Colors](../../constants/Colors.md), [Fonts](../../constants/Fonts.md), `expo-haptics`.

## Used by

[FastingScreen](../../features/fasting/screens/FastingScreen.md),
[FastComplete](../../features/fasting/components/FastComplete.md),
[WaterScreen](../../features/water/screens/WaterScreen.md),
[HistoryScreen](../../features/workouts/screens/HistoryScreen.md) (empty state).

## Tests

none.

## Gotchas / TODO

The library [Button](Button.md) `default` variant is chalk, not accent; use
this for a screen's primary action.
