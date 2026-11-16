# `features/fasting/components/FastRing.tsx`

## Purpose

The fast's progress ring: a chalk arc on a dark track (it shows status, so it
is not orange), with one big Oswald number in the middle and a short caption.

## Public API

| Prop | Type | Meaning |
|---|---|---|
| `progress` | `number` | 0..100 of the goal (clamped) |
| `value` | `string` | the big number, e.g. `"7:42"` |
| `caption` | `string` | the line under it, e.g. `"left · 52%"` |
| `size` | `number = 248` | diameter |

## How it works

Two `react-native-svg` circles, stroke 12: the `secondary` track and a
`foreground` arc (`strokeDasharray` = circumference, offset from progress),
rotated -90 degrees to start at 12 o'clock with a round cap. At 0 the arc is
not drawn (a round cap would leave a dot). The view is a `progressbar` with
`accessibilityValue` 0..100 and the number and caption as its label.

## Depends on

`react-native-svg`, [Colors](../../../constants/Colors.md), [Fonts](../../../constants/Fonts.md).

## Used by

[FastingScreen](../screens/FastingScreen.md).

## Tests

none.

## Gotchas / TODO

No animation between values; it moves once a second with the timer.
