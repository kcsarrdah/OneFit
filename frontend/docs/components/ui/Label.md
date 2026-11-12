# `components/ui/Label.tsx`

## Purpose

A form label: 14 / 500 text, optionally pressable.

## Public API

`Label` (forwardRef to `Text`): `children`, `style?: ViewStyle` (wrapper, when
pressable), `textStyle?: TextStyle`, `disabled?`, `onPress?`.

## How it works

With `onPress` it is a `TouchableOpacity` around the `Text`; without, just the
`Text`. Disabled uses `tabIconDefault`.

## Depends on

[useThemeColor](../../hooks/useThemeColor.md).

## Used by

Nothing (forms write labels with `ThemedText`).

## Tests

none.

## Gotchas / TODO

Unused. Without `onPress`, `style` is ignored.
