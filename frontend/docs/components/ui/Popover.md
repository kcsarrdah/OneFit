# `components/ui/Popover.tsx`

## Purpose

A tap-to-open popover, implemented as a centred transparent `Modal` (no
anchoring).

## Public API

- `Popover({ children })`: provides `{ isOpen, openPopover, closePopover }`.
- `PopoverTrigger({ children, asChild? })`: with `asChild`, clones the child
  with `onPress: openPopover`; otherwise wraps it in a `TouchableOpacity`.
- `PopoverContent({ children, style?, side?, align? })`: the modal card
  (`popover` colour, max width 300); tapping the backdrop closes it.

Throws if a trigger or content is used outside `Popover`.

## How it works

Content springs its own scale from 0 to 1 when opened. `closePopover` springs
the provider's scale to 0 and then sets `isOpen` false.

## Depends on

[Colors](../../constants/Colors.md), [useColorScheme](../../hooks/useColorScheme.md), `Animated`.

## Used by

nothing at the moment (the fasting ring that used it for milestone markers
was replaced by [FastRing](../../features/fasting/components/FastRing.md)).

## Tests

none.

## Gotchas / TODO

- `side` and `align` are ignored.
- Two scale values: the provider's (animated on open/close) is never applied
  to anything, so closing just waits for an invisible spring, then vanishes.
  The content's scale is never reset to 0, so the second open does not
  animate.
