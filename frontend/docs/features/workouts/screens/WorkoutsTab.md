# `features/workouts/screens/WorkoutsTab.tsx`

## Purpose

The Workouts tab: shows the screen picked in the sidebar (Workout, Routines,
Exercises, History) and owns the workout session.

## Public API

Default export `WorkoutsTab()`, re-exported by [app/(tabs)/workouts](../../../app/(tabs)/workouts.md).

## How it works

`switch (currentSidebarOption)` from [NavigationContext](../../../contexts/NavigationContext.md):

| Sidebar id | Screen |
|---|---|
| `routines` | [RoutinesScreen](RoutinesScreen.md); starting a routine appends its exercises to the session and switches to `workout` |
| `exercises` | [ExercisesScreen](ExercisesScreen.md) |
| `workout-history` | [HistoryScreen](HistoryScreen.md) |
| `workout` / anything else | [WorkoutScreen](WorkoutScreen.md) with the session |

`useWorkoutSession()` lives here so the session survives switching sidebar
options. Wrapped in a [ThemedView](../../../components/ThemedView.md) with
`paddingBottom: insets.bottom + 20`.

## Depends on

[NavigationContext](../../../contexts/NavigationContext.md), [useWorkoutSession](../hooks/useWorkoutSession.md),
the four screens, `react-native-safe-area-context`.

## Used by

[app/(tabs)/workouts](../../../app/(tabs)/workouts.md).

## Tests

none.

## Gotchas / TODO

- Sub-screens are switched by context state, not routes: no deep links, no
  back gesture between them, and the sidebar's `route` values are unused.
- Switching away unmounts the screen; local state such as the Routines
  filter resets.
