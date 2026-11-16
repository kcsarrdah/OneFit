# `components/ExternalLink.tsx`

## Purpose

Expo template: a link that opens an external URL in the in-app browser on
native and in a new tab on web.

## Public API

`ExternalLink(props)`: expo-router `Link` props, with `href: Href & string`.

## How it works

Renders `Link target="_blank"`. On native, `onPress` prevents the default and
calls `expo-web-browser`'s `openBrowserAsync(href)`.

## Depends on

`expo-router`, `expo-web-browser`.

## Used by

[app/(tabs)/explore](../app/(tabs)/explore.md).

## Tests

none.

## Gotchas / TODO

A caller's own `onPress` is overwritten (it is spread before `onPress`).
