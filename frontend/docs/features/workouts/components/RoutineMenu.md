# `features/workouts/components/RoutineMenu.tsx`

## Purpose

A routine's ⋯ menu: Duplicate and, for custom routines, Delete with a
confirmation, in one dialog.

## Public API

| Prop | Type | Meaning |
|---|---|---|
| `visible` | `boolean` | |
| `routineName` | `string` | dialog title |
| `canDelete` | `boolean` | shows Delete (custom routines only) |
| `onDuplicate` / `onDelete` | `() => void` | called after the dialog closes |
| `onClose` | `() => void` | |

## How it works

A [Dialog](../../../components/ui/Dialog.md) with two steps: the menu
(Duplicate, Delete, Cancel), and after Delete the same dialog becomes
"Delete routine?" with Cancel and a red Delete. One dialog instead of a
second modal, because stacking or swapping React Native modals is unreliable
on iOS. Closing always resets to the menu step.

## Depends on

[Dialog](../../../components/ui/Dialog.md), [Button](../../../components/ui/Button.md).

## Used by

[RoutineCard](RoutineCard.md).

## Tests

none.

## Gotchas / TODO

The confirm step repeats [ConfirmDialog](../../../components/ui/ConfirmDialog.md)'s
layout and copy instead of reusing it (see above).
