# `index.html`

## Purpose

The single HTML entry Vite serves and builds.

## Public API

- `<html lang="en" data-theme="iron">`: Iron is the default theme before React
  runs, so the first paint already uses its palette. `App` then sets
  `data-theme` from the stored choice (see [themes](src/theme/themes.md)).
- Google Fonts: Inter (body), Oswald (display font of the gym themes), Rajdhani
  (display font of Hologram), with preconnects to `fonts.googleapis.com` and
  `fonts.gstatic.com`.
- `<div id="root">` and `<script type="module" src="/src/main.tsx">`.
- `<title>OneFit · Muscle Explorer</title>`, meta description, `/favicon.svg`.

## How it works

Plain Vite entry; nothing is inlined.

## Depends on

[`src/main.tsx`](src/main.md), `public/favicon.svg`.

## Used by

Vite (dev and build).

## Tests

none.

## Gotchas / TODO

- With a stored theme other than `iron`, the page shows Iron until `App`'s
  effect runs. A small inline script reading `localStorage['onefit:theme']`
  would remove that flash.
