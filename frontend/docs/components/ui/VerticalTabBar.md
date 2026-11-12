# `components/ui/VerticalTabBar.tsx`

## Purpose

The floating liquid-glass sidebar on the left: the current tab's sections
(e.g. Workout, Routines, Exercises, History) and the global options
(Analytics, Settings).

## Public API

`VerticalTabBar({ position?: 'left' | 'right' = 'left', topOffset?: number = 20, maxHeight?: number = 400 })`.

## How it works

- Options come from [NavigationContext](../../contexts/NavigationContext.md)
  `getSidebarOptions()` for the current mode (derived from the route); the
  `separator` entry is filtered out.
- On mount, or after a mode change resets the selection, the first option is
  selected (`setCurrentSidebarOption`).
- Pressing a mode option only sets `currentSidebarOption`; the tab's screen
  reads it and swaps content (see [WorkoutsTab](../../features/workouts/screens/WorkoutsTab.md)).
  Pressing a global option also calls `router.push(option.route)`.
- Height: `options x tabHeight + 16`, capped at `maxHeight`; scrolls and
  bounces only when capped. Width 55 (iOS) / 60 (Android), 15 px from the edge,
  `insets.top + topOffset` from the top.
- Same two-layer glass as [ScrollableTabBar](ScrollableTabBar.md); global
  options use the muted icon colour; an optional `badge` shows a destructive
  pill.
- Returns `null` in focus mode or when the mode has no config.

## Depends on

[NavigationContext](../../contexts/NavigationContext.md), [IconSymbol](IconSymbol.md),
[Colors](../../constants/Colors.md), [useColorScheme](../../hooks/useColorScheme.md),
`expo-router`, `expo-haptics`, `react-native-safe-area-context`.

## Used by

[SideBarLayout](SideBarLayout.md).

## Tests

none.

## Gotchas / TODO

- `/analytics` and `/settings` do not exist; pressing them lands on
  [+not-found](../../app/+not-found.md).
- Only Workouts reads `currentSidebarOption`. On Fasting, Water, Nutrition,
  Home, Habits and Explore the sidebar items highlight but change nothing.
- The sidebar overlays content (absolute). Screens must pad
  `GlassEffectConfig.dimensions.vertical.contentInset` themselves; only
  [PickNext](../../features/workouts/components/PickNext.md) does, so it covers
  the left edge of the other screens.
- `option.icon as any`: icons are not type-checked against the
  [IconSymbol](IconSymbol.md) map (all current ones are mapped).
- Lint: `Colors` imported twice.
