# `components/ui/RadioGroup.tsx`

## Purpose

Radio buttons sharing one value through context.

## Public API

- `RadioGroup` (forwardRef to `View`): `value?`, `onValueChange?(value)`,
  `disabled?`, `style?`, `children`.
- `RadioGroupItem` (forwardRef): `value`, `id?`, `disabled?`, `style?`.
  Renders only the circle; put the label next to it yourself.

## How it works

The group provides `{ value, onValueChange, disabled }`; an item is selected
when its `value` equals the group's. Selected uses `primary` (chalk) for the
ring and dot. `accessibilityRole="radio"` with `checked`/`disabled` state.

## Depends on

[useThemeColor](../../hooks/useThemeColor.md).

## Used by

[RoutineDetailsStep](../../features/workouts/components/RoutineDetailsStep.md)
(difficulty and category).

## Tests

none.

## Gotchas / TODO

- The label is a separate `ThemedText`, so tapping the label does not select
  and screen readers announce an unnamed radio. Accept a `label` prop.
- `id` is unused. Lint: unused `TextStyle`, `Platform`, `IconSymbol`.
