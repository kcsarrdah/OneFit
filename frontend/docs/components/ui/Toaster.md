# `components/ui/Toaster.tsx`

## Purpose

Renders the current toasts from [useToast](../../hooks/useToast.md) at the top
of the screen.

## Public API

`Toaster()`: no props.

## How it works

Subscribes with `useToast()` and maps `toasts` to [Toast](Toast.md)s inside an
absolute, full-width, `zIndex: 1000` view.

## Depends on

[useToast](../../hooks/useToast.md), [Toast](Toast.md).

## Used by

Nothing: it is not mounted anywhere.

## Tests

none.

## Gotchas / TODO

**Not mounted**, so every `toast()` call in the app (fasting "Fast Saved",
"Save Failed", "Fast Discarded") is invisible. Mount `<Toaster />` once,
e.g. in [app/_layout](../../app/_layout.md) inside the providers.
