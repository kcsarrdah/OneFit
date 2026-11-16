# `components/ui/Badge.tsx`

## Purpose

A small pill label, with colour variants per muscle group and the standard
shadcn ones.

## Public API

`Badge` (forwardRef to `View`), `BadgeProps`:

| Prop | Type |
|---|---|
| `variant` | `'chest' \| 'back' \| 'shoulders' \| 'arms' \| 'legs' \| 'core' \| 'default' \| 'secondary' \| 'destructive' \| 'outline'` |
| `size` | `'sm' \| 'default' \| 'lg'` |
| `children` | `ReactNode` (rendered inside a `Text`) |
| `style`, `textStyle` | style overrides |

## How it works

Muscle variants use fixed Tailwind 500 colours (red, blue, yellow, green,
orange, teal) with white text; standard variants use iron tokens.
`alignSelf: 'flex-start'` so it hugs its text.

## Depends on

[Colors](../../constants/Colors.md), [useColorScheme](../../hooks/useColorScheme.md).

## Used by

[RoutineExercisesStep](../../features/workouts/components/RoutineExercisesStep.md)
(muscle-group filter chips, `default`/`outline` only).

## Tests

none.

## Gotchas / TODO

The muscle-group colours are off-palette for iron and unused.
