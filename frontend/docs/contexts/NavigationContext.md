# `contexts/NavigationContext.tsx`

## Purpose

App navigation state outside the router: which mode (tab) is active, which
sidebar option is selected, the sidebar's options per mode, and focus mode.

## Public API

Types: `NavigationMode` (`'home' | 'fasting' | 'water' | 'workouts' | 'habits' | 'nutrition' | 'explore'`),
`SidebarOption { id, label, icon, route, badge? }`,
`NavigationConfig { mode, title, icon, globalOptions, modeSpecificOptions }`.

`NavigationProvider({ children })` and `useNavigation()` (throws outside the
provider), returning:

| Field | Type | Meaning |
|---|---|---|
| `currentMode` | `NavigationMode` | Derived from the route |
| `setCurrentMode(mode)` | | Also clears the sidebar selection |
| `currentSidebarOption` | `string \| null` | Selected sidebar id |
| `setCurrentSidebarOption(id)` | | |
| `navigationConfig` | `NavigationConfig[]` | The table below |
| `getCurrentConfig()` | `NavigationConfig \| undefined` | |
| `getSidebarOptions()` | `SidebarOption[]` | Mode options, a `separator`, then global options |
| `focusMode` | `boolean` | Full-screen task: hides the header, sidebar and tab bar |
| `setFocusMode(focus)` | | |

Sidebar options per mode (ids):

| Mode | Options |
|---|---|
| home | overview, goals, streaks |
| fasting | timer, schedules, progress, tips |
| water | tracker, goals, reminders |
| workouts | workout, routines, exercises, workout-history |
| habits | dashboard, new-habit, categories |
| nutrition | log, search, recipes, macros |
| explore | discover, community, challenges |
| all (global) | analytics (`/analytics`), settings (`/settings`) |

## How it works

An effect watches `useSegments()`: with `['(tabs)', 'water']` it finds the
config whose `mode` equals the second segment and, if it changed, sets the
mode and clears the sidebar selection; [VerticalTabBar](../components/ui/VerticalTabBar.md)
then selects the first option. `focusMode` is set by
[WorkoutScreen](../features/workouts/screens/WorkoutScreen.md) while a set is
being logged and read by [app/_layout](../app/_layout.md),
[ScrollableTabBar](../components/ui/ScrollableTabBar.md) and `VerticalTabBar`.

## Depends on

`expo-router` `useSegments`.

## Used by

[app/_layout](../app/_layout.md) (provider and header), [VerticalTabBar](../components/ui/VerticalTabBar.md),
[ScrollableTabBar](../components/ui/ScrollableTabBar.md), [WorkoutsTab](../features/workouts/screens/WorkoutsTab.md),
[WorkoutScreen](../features/workouts/screens/WorkoutScreen.md).

## Tests

none.

## Gotchas / TODO

- No segment of the Home tab (`app/(tabs)/index.tsx`) is `home`, so visiting
  Home does not switch the mode to `home`; the sidebar keeps the previous tab's options
  (on first launch it starts in `home`, so it looks right).
- Only the workouts options do anything (see [WorkoutsTab](../features/workouts/screens/WorkoutsTab.md));
  the `route` values of mode options (`/workouts/routines`, ...) are not real
  routes and are never navigated to.
- The context value is a new object each render, and its functions are not
  memoised; every consumer re-renders on any change.
