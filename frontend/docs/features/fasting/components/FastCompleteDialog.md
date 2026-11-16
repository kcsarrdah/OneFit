# `features/fasting/components/FastCompleteDialog.tsx`

## Purpose

Shown when a fast ends: its length, whether the goal was hit, optional notes,
and Save / Discard.

## Public API

`FastCompleteDialog({ visible, fast: CompletedFastData | null, notes, onNotes, saving, onSave, onDiscard, onDismiss })`.

## How it works

A [Dialog](../../../components/ui/Dialog.md): title "Fast Complete!",
"Duration: 16h 0m" ([formatHoursMinutes](../lib/format.md)) plus
" 🎉 Goal achieved!" or " (Early completion)", a multi-line notes
`TextInput`, and Discard (outline) / Save Fast (accent; "Saving..." while
saving). Both buttons are disabled while saving.

## Depends on

[Dialog](../../../components/ui/Dialog.md), [Button](../../../components/ui/Button.md),
[format](../lib/format.md), [types](../types.md), [Colors](../../../constants/Colors.md).

## Used by

[FastingScreen](../screens/FastingScreen.md), with state from
[useFastCompletion](../hooks/useFastCompletion.md).

## Tests

none.

## Gotchas / TODO

- Tapping the backdrop calls `onDismiss` (`closeModal`), which drops the fast
  without the "discarded" message; easy to lose a fast by accident.
- Uses its own `TextInput` rather than [Textarea](../../../components/ui/Textarea.md).
