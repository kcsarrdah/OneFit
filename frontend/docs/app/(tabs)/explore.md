# `app/(tabs)/explore.tsx`

## Purpose

The Explore tab. Still the Expo starter's "Explore" screen.

## Public API

Default export `TabTwoScreen`: [ParallaxScrollView](../../components/ParallaxScrollView.md)
with a code icon header and [Collapsible](../../components/Collapsible.md) sections
(routing, platforms, images, fonts, light/dark mode, animations) with
[ExternalLink](../../components/ExternalLink.md)s to the Expo docs.

## How it works

Template content only.

## Depends on

`ParallaxScrollView`, `Collapsible`, `ExternalLink`, `ThemedText`, `ThemedView`,
[IconSymbol](../../components/ui/IconSymbol.md), `expo-image`, `assets/images/react-logo.png`.

## Used by

expo-router (`/explore`).

## Tests

none.

## Gotchas / TODO

Placeholder. It is the only user of `Collapsible`, `ExternalLink` and the
`SpaceMono` font. Its copy ("light and dark mode support") no longer matches
the dark-only app.
