# `features/water/components/WaterFill.tsx`

## Purpose

The water rising from the bottom of the screen as the day's intake grows,
with a gently bobbing surface line and a breathing shimmer.

## Public API

`WaterFill({ fraction: number })`: 0 (empty) to 1 (goal reached).

## How it works

- Absolute-fill frame (`zIndex 10`, `pointerEvents: 'none'`), measured on
  layout. The water body is `height + 48` tall (overfill, so an overshoot
  never shows a gap) and translated down by `frameHeight x (1 - level)`. The
  level is a transform, never a height, so changes trigger no layout.
- `level` springs to each new `fraction` (`damping 16, stiffness 110`:
  slightly underdamped, a soft slosh) from wherever it is, so quick taps and
  resets glide. The first value is applied without animation.
- Surface line bobs 2 px (2 s half-period); a shimmer bar breathes between
  0.3 and 0.7 opacity (1.5 s); both sine-eased, repeating.
- Reduce Motion: the level is set directly and the surface and shimmer stop.
- Colours: body `WaterColors.high`, surface and shimmer translucent blues.

## Depends on

`react-native-reanimated`, [Colors](../../../constants/Colors.md) (`WaterColors`).

## Used by

[WaterScreen](../screens/WaterScreen.md).

## Tests

none.

## Gotchas / TODO

`pointerEvents` is set inside `StyleSheet` (supported on new RN versions; the
older prop form would be needed on old ones).
