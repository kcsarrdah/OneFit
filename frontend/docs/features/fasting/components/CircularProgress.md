# `features/fasting/components/CircularProgress.tsx`

## Purpose

The fasting progress ring: an accent-gradient SVG arc with the percentage and
time in the middle, and optional milestone markers with popovers.

## Public API

| Prop | Type | Default |
|---|---|---|
| `percentage` | `number` (0..100) | |
| `size` | `number` | 200 |
| `strokeWidth` | `number` | 15 |
| `label` | `string?` | text above the percentage |
| `timeRemaining` | `string?` | text below it |
| `milestones` | `FastingMilestone[]` | `[]` |
| `goalDurationSeconds` | `number` | 0 |

## How it works

- Two `react-native-svg` circles: a `border`-coloured track and the progress
  arc (`strokeDasharray` = circumference, `strokeDashoffset` from the
  percentage), rotated -90 degrees to start at 12 o'clock, with a linear
  gradient `accent` to `accentGradientEnd`. The gradient id is random per
  instance.
- Milestones within the goal are placed on the ring at
  `timeHours x 3600 / goal` of the way round, each a 32 px button that opens a
  [Popover](../../../components/ui/Popover.md) with its name and description.

## Depends on

`react-native-svg`, [Popover](../../../components/ui/Popover.md), [IconSymbol](../../../components/ui/IconSymbol.md),
[Colors](../../../constants/Colors.md), [useColorScheme](../../../hooks/useColorScheme.md),
[constants](../constants.md) (type).

## Used by

[FastingScreen](../screens/FastingScreen.md) (without milestones).

## Tests

none.

## Gotchas / TODO

- No animation between values; it jumps every second.
- At 0% the round line cap still draws a dot at the top.
- No accessibility role or value for the ring.
