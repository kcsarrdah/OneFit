# `components/ui/NumberInput.tsx`

## Purpose

A numeric field with minus/plus buttons, min/max and precision.

## Public API

`NumberInput` (forwardRef to `TextInput`): `TextInputProps` except
`value`/`onChangeText`/`keyboardType`, plus:

| Prop | Type | Meaning |
|---|---|---|
| `value` | `number` | Current value |
| `onValueChange` | `(n: number) => void` | Called with the constrained value |
| `min`, `max` | `number?` | Clamp |
| `step` | `number` = 1 | Button step |
| `precision` | `number` = 0 | Decimal places (0 rounds to integers) |
| `showControls` | `boolean` = true | Show the buttons |
| `suffix` | `string?` | e.g. "kg" |
| `containerStyle`, `inputStyle`, `error` | | |

## How it works

Keeps a text `inputValue` alongside the numeric `value`. Typing calls
`onValueChange(constrain(parseFloat(text)))` on every keystroke; blur
re-formats; buttons step and clamp; the props-to-text effect re-syncs when
`value` changes. `0` is shown as an empty field.

## Depends on

[useThemeColor](../../hooks/useThemeColor.md).

## Used by

[RoutineDetailsStep](../../features/workouts/components/RoutineDetailsStep.md)
(estimated minutes, 5..180, step 5).

## Tests

none.

## Gotchas / TODO

- Clamping on every keystroke fights typing: with `min={5}`, typing "30"
  sends 5 after the "3", and the sync effect rewrites the field to "5". Clamp
  on blur instead.
- A value of 0 displays as empty, so 0 cannot be shown.
- Lint: `formatValue` missing from four hook dependency arrays.
