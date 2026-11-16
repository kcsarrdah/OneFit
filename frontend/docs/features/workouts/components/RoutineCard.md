# `features/workouts/components/RoutineCard.tsx`

## Purpose

One routine on the Routines screen: name, description, minutes / exercises /
category, and Start, Duplicate and (custom only) Delete, which asks for
confirmation first.

## Public API

`RoutineCard({ routine: AnyRoutine, onStart, onDuplicate, onDelete })` (all
callbacks `() => void`).

## How it works

[isCustomRoutine](../lib/routines.md) adds an accent "• Custom" after the name
and shows the Delete button, which opens a
[ConfirmDialog](../../../components/ui/ConfirmDialog.md) ("Delete routine?",
Cancel / Delete); only Delete calls `onDelete`. Stats are three [StatColumn](StatColumn.md)s.
"Start Workout" is the accent button.

## Depends on

[Card](../../../components/ui/Card.md), [Button](../../../components/ui/Button.md),
[ConfirmDialog](../../../components/ui/ConfirmDialog.md), [ThemedText](../../../components/ThemedText.md), [StatColumn](StatColumn.md),
[routines](../lib/routines.md), [Colors](../../../constants/Colors.md).

## Used by

[RoutinesScreen](../screens/RoutinesScreen.md).

## Tests

none.

## Gotchas / TODO

The stats row's top and bottom borders are `rgba(0,0,0,0.1)`, invisible on
the dark card; use `colors.border`.
