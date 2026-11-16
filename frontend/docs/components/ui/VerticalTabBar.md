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
- Size from `GlassEffectConfig.dimensions.vertical` in [Colors](../../constants/Colors.md):
  60 pt wide, 64 pt per item, so six items (four sections plus Analytics and
  Settings) fit the 400 pt cap without scrolling. Height is
  `items x 64 + 16`, capped at `maxHeight`; it scrolls and bounces only when
  capped. 15 pt from the edge, `insets.top + topOffset` from the top.
- Each item is the full 60 pt wide so labels like "Schedules" and
  "Reminders" fit at 10 pt on one line; the active item gets a 52 pt soft
  glass pill (`rgba(255,255,255,0.10)`) drawn behind icon and label, a
  slightly larger icon and a semibold label.
- Always the dark glass (`GlassmorphismColors.dark`): the app is dark only.
  Global options use the muted icon colour; an optional `badge` shows a red pill.
- Returns `null` in focus mode or when the mode has no config.

## Depends on

[NavigationContext](../../contexts/NavigationContext.md), [IconSymbol](IconSymbol.md),
[Colors](../../constants/Colors.md), `expo-router`, `expo-haptics`,
`react-native-safe-area-context`.

## Used by

[SideBarLayout](SideBarLayout.md).

## Tests

none.

## Gotchas / TODO

- `/analytics` and `/settings` do not exist; pressing them lands on
  [+not-found](../../app/+not-found.md).
- Only Workouts reads `currentSidebarOption`. On Fasting, Water, Nutrition,
  Home, Habits and Explore the sidebar items highlight but change nothing.
- The sidebar overlays content (absolute). Every screen pads
  `GlassEffectConfig.dimensions.vertical.contentInset` (84 pt) on the left
  itself; a new screen must too.
- `option.icon as any`: icons are not type-checked against the
  [IconSymbol](IconSymbol.md) map (all current ones are mapped).
