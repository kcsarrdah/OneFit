# `features/workouts/components/RoutineCard.tsx`

## Purpose

One routine on the Routines screen, as a row: name, a one-line summary, a ⋯
button for Duplicate / Delete, and the orange start button.

## Public API

`RoutineCard({ routine: AnyRoutine, onStart, onDuplicate, onDelete })`.

## How it works

- A `card` row, radius 18, at least 72 pt: name (16 semibold) and
  `routineSummary(routine)` ("45 min · 5 exercises · Full Body", led by
  "Custom · " for the user's own), each up to two lines.
- A 44 pt ⋯ button opens [RoutineMenu](RoutineMenu.md) (Delete only for
  custom routines, and it confirms first).
- A 44 pt accent circle with a play icon starts the routine: the row's one
  orange element. Labelled "Start <name>".

## Depends on

[RoutineMenu](RoutineMenu.md), [routines](../lib/routines.md), [IconSymbol](../../../components/ui/IconSymbol.md),
[Colors](../../../constants/Colors.md).

## Used by

[RoutinesScreen](../screens/RoutinesScreen.md).

## Tests

The summary: [routines.test](../../../__tests__/features/workouts/lib/routines.test.md). The component: none.

## Gotchas / TODO

The description is no longer shown; it is still stored on each routine.
