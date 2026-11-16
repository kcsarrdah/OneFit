# `features/water/screens/WaterScreen.tsx`

## Purpose

The water tracker: today's intake in big numbers, what is left of the goal,
and the screen filling with water as you log.

## Public API

`WaterScreen()`, re-exported by [app/(tabs)/water](../../../app/(tabs)/water.md).

## How it works

From [useHydration](../hooks/useHydration.md): a loading line until loaded,
then intake ("1,250ml", 64 bold), "Remaining 750ml of 2,000ml", "N% Complete",
[HydrationActions](../components/HydrationActions.md), and
[WaterFill](../components/WaterFill.md) behind everything at
[fillFraction](../lib/hydration.md).

## Depends on

[useHydration](../hooks/useHydration.md), [hydration](../lib/hydration.md),
[HydrationActions](../components/HydrationActions.md), [WaterFill](../components/WaterFill.md),
[Colors](../../../constants/Colors.md).

## Used by

[app/(tabs)/water](../../../app/(tabs)/water.md).

## Tests

none.

## Gotchas / TODO

- The "ml" suffix is a nested `Text` with the same 64 px style, not a smaller
  unit.
- The headline text sits above the water (`zIndex 20`) in chalk; once the
  water rises past it, contrast depends on the blue.
- Headings use system bold, not Oswald.
