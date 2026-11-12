# `components/ui/Stepper.tsx`

## Purpose

A minus / plus pill for nudging a number by a fixed step, with the step shown
in the middle ("2.5 kg", "1 rep").

## Public API

```tsx
<Stepper step="2.5 kg" name="weight" onDecrement={...} onIncrement={...} />
```

| Prop | Type | Meaning |
|---|---|---|
| `step` | `string` | Text between the buttons |
| `name` | `string` | Used in accessible names: "Less weight", "More weight" |
| `onDecrement` / `onIncrement` | `() => void` | Called on tap |

## How it works

Two 48 px round `Pressable`s (pressed colour `input`, else `secondary`) on a
`card` pill with `flex: 1`. Each tap gives a selection haptic (not on web).
The caller owns the value and the clamping.

## Depends on

[IconSymbol](IconSymbol.md) (`minus`, `plus`), [Colors](../../constants/Colors.md), `expo-haptics`.

## Used by

[SetLogger](../../features/workouts/components/SetLogger.md).

## Tests

none.

## Gotchas / TODO

No press-and-hold repeat.
