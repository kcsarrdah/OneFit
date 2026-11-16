# `components/ui/TabBarBackground.ios.tsx`

## Purpose

iOS build of [TabBarBackground](TabBarBackground.md): a blurred tab bar
background, and `useBottomTabOverflow` returning the real tab bar height.

## Public API

- Default export `BlurTabBarBackground()`: a faint `secondary` tint (`20`
  alpha) under an `expo-blur` `BlurView` (intensity 15, dark tint), radius
  27.5.
- `useBottomTabOverflow()`: `useBottomTabBarHeight()`.

## How it works

Metro picks `.ios.tsx` on iOS.

## Depends on

`expo-blur`, `@react-navigation/bottom-tabs`, [useColorScheme](../../hooks/useColorScheme.md),
[useThemeColor](../../hooks/useThemeColor.md).

## Used by

`useBottomTabOverflow` via [ParallaxScrollView](../ParallaxScrollView.md) on iOS.
The background is not rendered.

## Tests

none.

## Gotchas / TODO

The app's glass bars do not use this blur. If real blur is wanted in the
liquid glass bars, this is the pattern to reuse.
