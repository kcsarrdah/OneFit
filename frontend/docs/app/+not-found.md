# `app/+not-found.tsx`

## Purpose

expo-router's fallback for unknown routes.

## Public API

Default export `NotFoundScreen`. Title "Oops!", text "This screen does not
exist." and a link to `/`.

## How it works

Sets the stack title with `<Stack.Screen options>`; uses
[ThemedText](../components/ThemedText.md) / [ThemedView](../components/ThemedView.md).

## Depends on

`expo-router` `Link`, `Stack`.

## Used by

expo-router. Reached today by the sidebar's global options (`/analytics`,
`/settings`), which have no routes; see [VerticalTabBar](../components/ui/VerticalTabBar.md).

## Tests

none.

## Gotchas / TODO

The link text is the template's "Hello world!!".
