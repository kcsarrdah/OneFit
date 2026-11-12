# `src/main.tsx`

## Purpose

Browser entry: mounts `<App />` inside React Query's provider and loads the
global stylesheet.

## Public API

none (side effects only).

## How it works

- Creates one `QueryClient` with `retry: 1` and `refetchOnWindowFocus: false`
  (the anatomy content is static; see [queries](api/queries.md)).
- Renders `<StrictMode><QueryClientProvider><App/></QueryClientProvider></StrictMode>`
  into `#root`.
- Imports [`index.css`](index.css.md).

## Depends on

[App](App.md), [index.css](index.css.md), `@tanstack/react-query`, `react-dom/client`.

## Used by

[`index.html`](../index.html.md).

## Tests

none. [App.test](App.test.md) builds its own `QueryClient` (with `retry: false`).

## Gotchas / TODO

- StrictMode double-invokes effects in dev; the 3D code attaches handles and
  fat twins in effects (with cleanup) for that reason.
