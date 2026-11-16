# `components/ui/ScrollableTabBar.tsx`

## Purpose

The floating liquid-glass tab bar along the bottom: seven tabs (Home,
Fasting, Water, Explore, Habits, Nutrition, Workouts), scrolling sideways
because they don't fit, and keeping the active one in view.

## Public API

`ScrollableTabBar(props: BottomTabBarProps)`, passed as `tabBar` in
[app/(tabs)/_layout](../../app/(tabs)/_layout.md).

## How it works

- One button per route, icon from a local `iconMap` (routes without an icon
  are skipped with a warning). Pressing emits `tabPress` and navigates unless
  prevented; light haptic on iOS.
- **Scroll to active.** Each tab's `x`/`width` is recorded from `onLayout`;
  the bar's width and the content width come from `onLayout` and
  `onContentSizeChange`. Whenever the active index (or those sizes) changes,
  it scrolls to [centeredScrollX](../../lib/tabBarScroll.md): the tab centred,
  clamped to the ends. The first scroll (on layout) jumps; later ones glide.
- The active tab sits on a soft glass pill (`rgba(255,255,255,0.10)`, radius
  22) with a larger icon and semibold label.
- Always the dark glass (`GlassmorphismColors.dark`), 40 pt from each side,
  `insets.bottom + 10` from the bottom, sizes from `GlassEffectConfig`.
- Returns `null` in focus mode.

## Depends on

[NavigationContext](../../contexts/NavigationContext.md) (`focusMode`),
[IconSymbol](IconSymbol.md), [Colors](../../constants/Colors.md),
[tabBarScroll](../../lib/tabBarScroll.md), `@react-navigation/bottom-tabs`,
`expo-haptics`, `react-native-safe-area-context`.

## Used by

[app/(tabs)/_layout](../../app/(tabs)/_layout.md).

## Tests

The scroll maths: [tabBarScroll.test](../../__tests__/lib/tabBarScroll.test.md).
The component itself: none.

## Gotchas / TODO

- Tab frames live in a ref; only a layout of the active tab triggers a
  re-render (`laidOut`), which is what makes the first scroll happen.
