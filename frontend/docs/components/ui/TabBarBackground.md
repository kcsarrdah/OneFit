# `components/ui/TabBarBackground.tsx`

## Purpose

Expo template tab bar background (Android and web) and the
`useBottomTabOverflow` helper.

## Public API

- Default export `TabBarBackground()`: an absolute-fill view in `secondary`
  plus `F0` alpha, radius 27.5.
- `useBottomTabOverflow(): number`: always `0` here.

## How it works

The iOS build is [TabBarBackground.ios](TabBarBackground.ios.md).

## Depends on

[useThemeColor](../../hooks/useThemeColor.md).

## Used by

Only `useBottomTabOverflow`, by [ParallaxScrollView](../ParallaxScrollView.md).
The background component itself is not rendered (the custom
[ScrollableTabBar](ScrollableTabBar.md) draws its own glass).

## Tests

none.

## Gotchas / TODO

The comment says "75%" but `F0` is about 94% alpha.
