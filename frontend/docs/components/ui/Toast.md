# `components/ui/Toast.tsx`

## Purpose

One toast: a card that slides down from the top and dismisses itself.

## Public API

`Toast(props: ToastProps)`; `ToastProps = { id, title?, description?, variant?: 'default' | 'destructive', open?: boolean = true, onOpenChange?(open), duration?: number = 5000 }`.

## How it works

On `open`: spring `translateY` -100 to 0 and fade in (old `Animated` API),
then after `duration` call `onOpenChange(false)`. On close: animate back up.
A close button calls `onOpenChange(false)`. Destructive uses the destructive
colours.

## Depends on

[Colors](../../constants/Colors.md), [useColorScheme](../../hooks/useColorScheme.md), [IconSymbol](IconSymbol.md).

## Used by

[Toaster](Toaster.md).

## Tests

none.

## Gotchas / TODO

- The close icon is `chevron.right` rotated 45 degrees, not an X, and has no
  accessible label.
- Not visible anywhere today: [Toaster](Toaster.md) is not mounted.
- Lint: missing `opacity`/`translateY` deps.
