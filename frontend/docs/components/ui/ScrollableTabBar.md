# `components/ui/ScrollableTabBar.tsx`

## Purpose

The floating liquid-glass tab bar along the bottom: a horizontally scrolling
row of the seven tabs.

## Public API

`ScrollableTabBar(props: BottomTabBarProps)`, passed as `tabBar` to `Tabs` in
[app/(tabs)/_layout](../../app/(tabs)/_layout.md).

Route-to-icon map (`iconMap`): `index` house.fill, `fasting` bolt.fill,
`water` drop.fill, `explore` paperplane.fill, `habits` heart.fill,
`nutrition` fork.knife, `workouts` figure.run.

## How it works

- Returns `null` in focus mode ([NavigationContext](../../contexts/NavigationContext.md)
  `focusMode`, set while logging a set).
- Absolutely positioned `insets.bottom + 10` from the bottom, 40 px from each
  side, height 55 (iOS) / 70 (Android), radius from `GlassEffectConfig`
  ([Colors](../../constants/Colors.md)).
- Glass: two layers, a 70%-opaque fill (`GlassmorphismColors.dark.background`)
  and a 3% white overlay with a hairline border. There is no real blur.
- Each tab: icon (28 focused / 24) and label (title, else route name). The
  focused tab gets a "bullet" pill behind it, positioned per platform.
- Press: light haptic on iOS, emits `tabPress`, navigates if not focused and
  not prevented (the standard React Navigation contract).

## Depends on

[IconSymbol](IconSymbol.md), [Colors](../../constants/Colors.md) (`GlassmorphismColors`,
`GlassEffectConfig`), [NavigationContext](../../contexts/NavigationContext.md),
[useColorScheme](../../hooks/useColorScheme.md), `expo-haptics`,
`react-native-safe-area-context`.

## Used by

[app/(tabs)/_layout](../../app/(tabs)/_layout.md).

## Tests

none.

## Gotchas / TODO

- A route missing from `iconMap` is skipped with `console.warn`.
- The bullet pill uses magic `left: '68%'`/`'73%'` offsets; it is not centred
  by layout and may drift with label widths.
- Screens are not padded for the bar; content near the bottom must add its own
  inset (PickNext uses `insets.bottom + 96`).
- Lint: unused `Colors`, `useThemeColor`, `config`; `Colors` imported twice.
