# `components/Collapsible.tsx`

## Purpose

Expo template: a heading that toggles its children open and closed.

## Public API

`Collapsible({ title: string, children })`.

## How it works

Local `isOpen` state; a `chevron.right` [IconSymbol](ui/IconSymbol.md) rotates
90 degrees when open. Children render in an indented [ThemedView](ThemedView.md)
only while open (no animation).

## Depends on

[ThemedText](ThemedText.md), [ThemedView](ThemedView.md), [IconSymbol](ui/IconSymbol.md),
[Colors](../constants/Colors.md), [useColorScheme](../hooks/useColorScheme.md).

## Used by

[app/(tabs)/explore](../app/(tabs)/explore.md).

## Tests

none.

## Gotchas / TODO

Template leftover; goes away with the Explore placeholder. No
`accessibilityState={{ expanded }}` on the toggle.
