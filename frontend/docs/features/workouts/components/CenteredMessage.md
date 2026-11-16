# `features/workouts/components/CenteredMessage.tsx`

## Purpose

A short message in the middle of the screen: loading states, empty states and
placeholders.

## Public API

`CenteredMessage({ title?: string, body: string, titleColor?: string, bodyColor?: string })`.

## How it works

`flex: 1`, centred, padding 28; optional bold 24 title above the body.

## Depends on

[ThemedText](../../../components/ThemedText.md).

## Used by

[RoutinesScreen](../screens/RoutinesScreen.md), [HistoryScreen](../screens/HistoryScreen.md),
[ExercisesScreen](../screens/ExercisesScreen.md).

## Tests

none.

## Gotchas / TODO

Generic enough for `components/ui` if another feature needs it.
