# `components/ui/Card.tsx`

## Purpose

Card container and its parts, ported from the shadcn web API.

## Public API

All `forwardRef`, all accept `style`:

| Export | Element | Default style |
|---|---|---|
| `Card` | `View` | `card` background, `border`, radius 8, 1 px border |
| `CardHeader` | `View` | padding 24 (no bottom), gap 6 |
| `CardTitle` | `Text` | 24 / 600, `cardForeground` |
| `CardDescription` | `Text` | 14, `mutedForeground` |
| `CardContent` | `View` | horizontal/bottom padding 24 |
| `CardFooter` | `View` | row, padding 24 (no top) |

## How it works

Plain views with theme colours from [Colors](../../constants/Colors.md).

## Depends on

[Colors](../../constants/Colors.md), [useColorScheme](../../hooks/useColorScheme.md).

## Used by

[FastingScreen](../../features/fasting/screens/FastingScreen.md), [HistoryScreen](../../features/workouts/screens/HistoryScreen.md),
[RoutineCard](../../features/workouts/components/RoutineCard.md), [WorkoutHistoryCard](../../features/workouts/components/WorkoutHistoryCard.md),
[RoutineExercisesStep](../../features/workouts/components/RoutineExercisesStep.md).

## Tests

none.

## Gotchas / TODO

`CardHeader`, `CardTitle`, `CardDescription` and `CardFooter` are not used;
callers write their own headers.
