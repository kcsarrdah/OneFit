# `features/water/screens/WaterScreen.tsx`

## Purpose

The water tracker: today's intake as one big number, what is left of the
goal, the screen filling with water as you log, and one action at the thumb.

## Public API

`WaterScreen()`, re-exported by [app/(tabs)/water](../../../app/(tabs)/water.md).

## How it works

- From [useHydration](../hooks/useHydration.md): an empty ground while
  loading, then:
- [ScreenTitle](../../../components/ui/ScreenTitle.md) "Water", the intake in
  Oswald 104 with a muted "ML" (shrinks to fit), and one muted line:
  "750 ml to go of 2,000" or "Goal reached · 2,000 ml", with
  [ResetIntake](../components/ResetIntake.md) on the right.
- [WaterFill](../components/WaterFill.md) behind everything at
  `fillFraction(intake, goal)`.
- An [ActionButton](../../../components/ui/ActionButton.md) "+ 250 ml" (the
  log amount) above the tab bar.
- Content is inset by `GlassEffectConfig.dimensions.vertical.contentInset`
  to clear the sidebar.

## Depends on

[useHydration](../hooks/useHydration.md), [hydration](../lib/hydration.md),
[WaterFill](../components/WaterFill.md), [ResetIntake](../components/ResetIntake.md),
[ActionButton](../../../components/ui/ActionButton.md), [ScreenTitle](../../../components/ui/ScreenTitle.md),
[Colors](../../../constants/Colors.md), [Fonts](../../../constants/Fonts.md).

## Used by

[app/(tabs)/water](../../../app/(tabs)/water.md).

## Tests

The hook and maths: [useHydration.test](../../../__tests__/features/water/hooks/useHydration.test.md),
[hydration.test](../../../__tests__/features/water/lib/hydration.test.md). The screen: none.

## Gotchas / TODO

- The water body stays blue: it is the water, not UI, so the one-accent rule
  does not apply to it.
- The sidebar's Goals and Reminders items do not change the screen yet.
