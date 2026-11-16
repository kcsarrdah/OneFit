# `components/ui/ConfirmDialog.tsx`

## Purpose

"Are you sure?" for destructive actions: a title, what will happen, Cancel
and a red confirm button. Use it instead of `Alert.alert`, which does nothing
on web (React Native Web).

## Public API

`ConfirmDialog(props)`:

| Prop | Type | Meaning |
|---|---|---|
| `visible` | `boolean` | Shown or not; the caller owns this state |
| `title` | `string` | e.g. "Delete workout?" |
| `description` | `string` | What will happen, e.g. "... This can't be undone." |
| `confirmLabel` | `string` | The red button, e.g. "Delete", "Reset" |
| `onConfirm` | `() => void` | Red button pressed |
| `onCancel` | `() => void` | Cancel, the backdrop, or Android back |

## How it works

A [Dialog](Dialog.md) with `DialogHeader` (title, description) and a row of
two equal [Button](Button.md)s: `outline` Cancel and `destructive` confirm
(`containerStyle` `flex: 1` so both share the row; 44 px tall). It does not
close itself: callers hide it in both callbacks.

## Depends on

[Dialog](Dialog.md), [Button](Button.md).

## Used by

[WorkoutHistoryCard](../../features/workouts/components/WorkoutHistoryCard.md),
[RoutineCard](../../features/workouts/components/RoutineCard.md),
[ResetIntake](../../features/water/components/ResetIntake.md),
[FastingScreen](../../features/fasting/screens/FastingScreen.md) (ending a fast early).

## Tests

none (the Jest setup mocks `react-native` down to `AppState` and `Platform`,
so components are not rendered in tests). Checked on Expo web at 375x812.

## Gotchas / TODO

- No haptic on confirm.
- Inherits [Dialog](Dialog.md)'s gotchas (no close animation).
