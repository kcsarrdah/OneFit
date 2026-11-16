# `components/ui/Dialog.tsx`

## Purpose

A centred modal dialog with a dimmed backdrop, and its layout parts.

## Public API

| Export | Props | Notes |
|---|---|---|
| `Dialog` | `visible`, `onDismiss`, `children`, `animationType?` | Transparent `Modal`; backdrop tap and Android back call `onDismiss` |
| `DialogContent` | `children`, `style?` | Padding 20, `background` + `border` |
| `DialogHeader` | `children`, `style?` | margin-bottom 16 |
| `DialogFooter` | `children`, `style?` | right-aligned row, gap 8 |
| `DialogTitle` | `children`, `style?` | 18 / 600, `text` |
| `DialogDescription` | `children`, `style?` | 14, `tabIconDefault` |
| `DialogClose` | `onPress` | Top-right close icon |

## How it works

The card is 90% wide (max 500), max 80% of the window height. Reanimated:
backdrop opacity 0 to 1 in 200 ms and card scale 0.9 to 1 (spring) when
`visible` turns on. The inner `TouchableWithoutFeedback` stops taps on the
card from dismissing.

## Depends on

`react-native-reanimated`, [useThemeColor](../../hooks/useThemeColor.md), [IconSymbol](IconSymbol.md).

## Used by

[FastCompleteDialog](../../features/fasting/components/FastCompleteDialog.md),
[ConfirmDialog](ConfirmDialog.md), [CreateCustomRoutineModal](../../features/workouts/components/CreateCustomRoutineModal.md).

## Tests

none.

## Gotchas / TODO

- `animationType` is accepted and ignored (`Modal` always uses `none`).
- The close animation never shows: `Modal visible={false}` unmounts at once.
- `DialogClose` draws a `chevron.right` rotated 45 degrees, not an X. It is
  unused.
- `style?: any` on the parts.
- `SCREEN_HEIGHT` is read once at import; rotation or web resizes do not
  update it.
- Lint: `useEffect` missing shared-value deps (harmless).
