# `components/ParallaxScrollView.tsx`

## Purpose

Expo template: a scroll view with a 250 px header image that parallaxes and
stretches on overscroll.

## Public API

Default export `ParallaxScrollView({ headerImage: ReactElement, headerBackgroundColor: { dark, light }, children })`.

## How it works

`useScrollViewOffset` drives the header's `translateY` (half speed when pulled
down, 0.75 when scrolled up) and `scale` (2 at 250 px overscroll). Bottom
padding comes from `useBottomTabOverflow()` in
[TabBarBackground](ui/TabBarBackground.md) (iOS variant: the tab bar height;
elsewhere 0).

## Depends on

`react-native-reanimated`, [ThemedView](ThemedView.md),
[TabBarBackground](ui/TabBarBackground.md), [useColorScheme](../hooks/useColorScheme.md).

## Used by

[app/(tabs)/index](../app/(tabs)/index.md), [app/(tabs)/explore](../app/(tabs)/explore.md).

## Tests

none.

## Gotchas / TODO

Template leftover. The app's tab bar is a custom, absolutely positioned
overlay, so the bottom padding does not account for it.
