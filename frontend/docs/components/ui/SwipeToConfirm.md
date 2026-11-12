# `components/ui/SwipeToConfirm.tsx`

## Purpose

Robinhood-style swipe up to confirm, as a screen layout: an accent bar at the
bottom that rises with the finger, takes over the screen and then confirms.

## Public API

```tsx
<SwipeToConfirm label="Swipe up to log" onConfirm={logSet}>...screen...</SwipeToConfirm>
```

| Prop | Type | Meaning |
|---|---|---|
| `label` | `string` | Bar text and accessible name |
| `releaseLabel` | `string` = `'Release to log'` | Shown once past the commit point |
| `onConfirm` | `() => void` | Runs after the sheet has filled the screen |
| `children` | `ReactNode` | The screen content above the bar |
| `enterFromFull` | `boolean` = `false` | Start covering the screen and lower into the bar (the way back from a full-screen confirmation) |
| `disabled` | `boolean` = `false` | Gesture off, bar in `secondary` colour |

## How it works

- Shared values: `height` (measured screen height), `progress` 0..1 (how far
  the sheet has risen) and `armed` (`progress >= COMMIT`).
- The sheet is a full-screen `Animated.View` translated down by
  `(height - bar) x (1 - progress)`, where `bar = 104 + insets.bottom`. Until
  measured it is parked at `translateY: 10000`, opacity 0. Corners go from 28
  to 0 between 85% and 100%.
- Pan (`activeOffsetY [-6, 6]`): `progress -= changeY / travel`. On release,
  `progress >= 0.4` or an upward flick faster than 900 px/s calls `finish()`;
  otherwise it springs back (`damping 18, stiffness 240`, no overshoot).
- `finish()` animates to 1 in 240 ms (`Easing.out(cubic)`), then on the JS
  thread: success haptic (not on web) and `onConfirm()`.
- Crossing the commit point either way gives a light haptic tick (via
  `useAnimatedReaction`), swaps the label to `releaseLabel` and nudges the
  chevron up 4 px.
- Content lifts 120 px, scales to 0.96 and fades out by 60% progress.
- `enterFromFull`: `progress` starts at 1 and lowers to 0 in 420 ms
  (`Easing.out(exp)`).
- Reduce Motion: the drag stays; content only fades (no lift/scale);
  `finish` and `enterFromFull` jump instead of animating.
- Accessibility: the bar is a `button` with an `activate` action that calls
  `finish()`, so the gesture is never required.
- Web: `touchAction: 'none'`, `cursor: grab`, `userSelect: none` on the sheet
  so the pan owns vertical drags.

## Depends on

`react-native-gesture-handler`, `react-native-reanimated`, `expo-haptics`,
`react-native-safe-area-context`, [IconSymbol](IconSymbol.md),
[Colors](../../constants/Colors.md), [Fonts](../../constants/Fonts.md).

## Used by

[SetLogger](../../features/workouts/components/SetLogger.md).

## Tests

none (gesture and Reanimated; the Jest setup cannot render components).

## Gotchas / TODO

- `onConfirm` runs after the fill animation, so the caller swaps to its
  full-screen confirmation already in the accent colour (that is the
  "takeover").
- `releaseLabel` defaults to "Release to log": pass one if you reuse this for
  something other than logging.
- Needs a `GestureHandlerRootView` ancestor (provided in
  [app/_layout](../../app/_layout.md)).
