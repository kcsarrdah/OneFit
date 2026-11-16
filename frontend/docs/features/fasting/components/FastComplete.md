# `features/fasting/components/FastComplete.tsx`

## Purpose

The end of a fast as a full-screen accent takeover (the same flood as a
logged set): how long it lasted, whether the goal was hit, an optional note,
then Save fast or Discard.

## Public API

| Prop | Type | Meaning |
|---|---|---|
| `fast` | `CompletedFastData` | the finished fast |
| `notes` / `onNotes` | `string` / `(s) => void` | the note field |
| `saving` | `boolean` | disables both actions, label "Saving…" |
| `onSave` / `onDiscard` | `() => void` | |

## How it works

- Absolute fill over the screen (`zIndex 2000`), accent background,
  near-black ink. The screen turns on focus mode while it shows, which hides
  the header, sidebar and tab bar.
- "FAST DONE" (Oswald 44), the length via `formatFastLength` (Oswald 104,
  shrinks to fit), then "Goal hit · 16h" or "Ended 2h 10m early".
- A bottom-ruled note input, then an inverted [ActionButton](../../../components/ui/ActionButton.md)
  "Save fast" and a near-black "Discard" text button.

## Depends on

[ActionButton](../../../components/ui/ActionButton.md), [format](../lib/format.md),
[types](../types.md), [Colors](../../../constants/Colors.md), [Fonts](../../../constants/Fonts.md),
`react-native-safe-area-context`.

## Used by

[FastingScreen](../screens/FastingScreen.md).

## Tests

none.

## Gotchas / TODO

- Saving posts to the backend ([useFastCompletion](../hooks/useFastCompletion.md));
  without the API running it shows the "Save Failed" toast and stays open.
- The placeholder is near-black at 70% on orange, about 3:1; fine for a
  placeholder, not for text.
