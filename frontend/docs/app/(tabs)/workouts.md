# `app/(tabs)/workouts.tsx`

## Purpose

The `/workouts` tab route: a one-line re-export of the feature screen.

## Public API

`export { default } from '@/features/workouts/screens/WorkoutsTab';`

## How it works

Route files stay one-line re-exports (`CLAUDE.md` rule 3). See
[WorkoutsTab](../../features/workouts/screens/WorkoutsTab.md), which switches
between the workout screens by sidebar option.

## Depends on

[WorkoutsTab](../../features/workouts/screens/WorkoutsTab.md).

## Used by

expo-router, as a tab of [(tabs)/_layout](_layout.md).

## Tests

none.

## Gotchas / TODO

`WorkoutsTab` is a default export while the other feature screens are named
exports, hence the different re-export form.
