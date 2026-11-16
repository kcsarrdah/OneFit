# `app/(tabs)/_layout.tsx`

## Purpose

The tab navigator: seven tabs, drawn by the floating glass
[ScrollableTabBar](../../components/ui/ScrollableTabBar.md), inside the
[SidebarLayout](../../components/ui/SideBarLayout.md) that adds the vertical glass sidebar.

## Public API

Default export `TabLayout`. Tabs, in order:

| Route file | Title |
|---|---|
| `index` | Home |
| `fasting` | Fasting |
| `water` | Water |
| `explore` | Explore |
| `habits` | Habits |
| `nutrition` | Nutrition |
| `workouts` | Workouts |

## How it works

`tabBar={(props) => <ScrollableTabBar {...props} />}` replaces the default
bar; `headerShown: false` (the root stack shows the "OneFit" header). Tint
colours come from `Colors[...]`, which are both iron.

## Depends on

[ScrollableTabBar](../../components/ui/ScrollableTabBar.md), [SideBarLayout](../../components/ui/SideBarLayout.md),
[Colors](../../constants/Colors.md), [useColorScheme](../../hooks/useColorScheme.md), `expo-router` `Tabs`.

## Used by

expo-router (`app/(tabs)/*`).

## Tests

none.

## Gotchas / TODO

Tab icons are not set here: `ScrollableTabBar` has its own `iconMap` keyed by
route name. A new tab needs an entry there (or it is skipped with a console
warning) and an entry in `NavigationContext`'s config for its sidebar.
