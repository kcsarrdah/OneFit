# `components/ThemedView.tsx`

## Purpose

Expo template `View` with the theme background colour.

## Public API

`ThemedView(props: ThemedViewProps)`; `ThemedViewProps = ViewProps & { lightColor?, darkColor? }`.

## How it works

`backgroundColor` from [useThemeColor](../hooks/useThemeColor.md)`(..., 'background')`
(iron `#0b0908`), then the caller's `style`.

## Depends on

[useThemeColor](../hooks/useThemeColor.md).

## Used by

[WorkoutsTab](../features/workouts/screens/WorkoutsTab.md),
[NutritionScreen](../features/nutrition/screens/NutritionScreen.md),
[Collapsible](Collapsible.md), [ParallaxScrollView](ParallaxScrollView.md),
the Habits, Home and Explore tabs, `+not-found`.

## Tests

none.

## Gotchas / TODO

none.
