# `components/ui/BigNumber.tsx`

## Purpose

A huge, tappable number with a caption under it: the weight and reps on the
set logger. Tap to type an exact value.

## Public API

```tsx
<BigNumber name="Weight" value={80} caption="KG" onChange={setWeight} format={formatWeight} decimal />
```

| Prop | Type | Meaning |
|---|---|---|
| `value` | `number` | Shown value |
| `caption` | `string` | Small label under it ("KG", "REPS") |
| `onChange` | `(value: number) => void` | Called with the typed value, clamped to `[0, max]` |
| `decimal` | `boolean` = `false` | Allow a decimal point (comma accepted) |
| `format` | `(v) => string` = `String` | Display format |
| `name` | `string` | Screen-reader name |
| `max` | `number` = `999` | Upper clamp |

## How it works

- Display mode: a `Pressable` with Oswald digits. Font size shrinks with
  length so two numbers fit side by side: 116 (up to 2 chars), 104 (3), 88 (4),
  76 (more). The value sits in a fixed 128 px, bottom-aligned box so captions
  line up.
- Tap sets `draft = ''` and swaps in an auto-focused `TextInput`
  (`decimal-pad` / `number-pad`) sized to the digits, with the current value
  as placeholder.
- Blur or submit commits: empty cancels; otherwise parse
  (`parseFloat`/`parseInt`), clamp, `onChange`; invalid input is ignored.

## Depends on

[Colors](../../constants/Colors.md), [Fonts](../../constants/Fonts.md).

## Used by

[SetLogger](../../features/workouts/components/SetLogger.md).

## Tests

none.

## Gotchas / TODO

- Clamps to `>= 0` only; the reps caller additionally enforces `>= 1` and
  rounds.
- `outlineStyle: 'none'` on web removes the focus ring; the accent underline
  is the only focus cue.
