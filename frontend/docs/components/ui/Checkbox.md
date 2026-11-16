# `components/ui/Checkbox.tsx`

## Purpose

An animated checkbox (React Native has none built in).

## Public API

`Checkbox` (forwardRef to `View`), `CheckboxProps`:
`checked: boolean`, `onCheckedChange(checked)`, `size?: 'sm' | 'default' | 'lg'`
(16 / 20 / 28 px), `variant?: 'default' | 'success' | 'warning' | 'destructive'`,
`disabled?`, `style?`.

## How it works

Reanimated: on `checked` change the box springs between scale 0.8 and 1, the
tick fades in 150 ms, and the fill/border interpolate from the theme
background/border to the variant colour in 200 ms. The tick is a "✓"
character.

## Depends on

`react-native-reanimated`, [useThemeColor](../../hooks/useThemeColor.md).

## Used by

Nothing.

## Tests

none.

## Gotchas / TODO

- Unused. Variant colours are Tailwind blue/green/yellow/red, not iron.
- No `accessibilityRole="checkbox"` or `accessibilityState`.
- Lint: unused `IconSymbol`, `foregroundColor`, `mutedColor`; `useEffect`
  missing shared-value deps (harmless).
