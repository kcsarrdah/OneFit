# `features/nutrition/screens/NutritionScreen.tsx`

## Purpose

Placeholder for meal logging. Meal components, hooks and pure logic go in
`features/nutrition/` as they are built.

## Public API

`NutritionScreen()`, re-exported by [app/(tabs)/nutrition](../../../app/(tabs)/nutrition.md):
"Nutrition" title and "Test tab for scrolling".

## How it works

[ThemedView](../../../components/ThemedView.md) + [ThemedText](../../../components/ThemedText.md).

## Depends on

`ThemedText`, `ThemedView`.

## Used by

[app/(tabs)/nutrition](../../../app/(tabs)/nutrition.md).

## Tests

none.

## Gotchas / TODO

The sidebar lists Food Log, Search Foods, Recipes and Macros; none exist. The
backend has a `meal` model (`backend/docs/models/meal.md`) the screen could
use later.
