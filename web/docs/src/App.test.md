# `src/App.test.tsx`

## Purpose

Integration tests for [App](App.md) with a mocked API.

## Public API

`describe('App')`, with `fetch` mocked by `vi.spyOn(globalThis, 'fetch')`
serving two muscles (`chest` front-only with 2 strength and 1 flexibility
exercise, `glutes` back-only) for `/api/anatomy/muscles` and
`/api/anatomy/muscles/:id` (404 JSON `{error}` otherwise). Each test renders
with a fresh `QueryClient` (`retry: false`).

| Test | Covers |
|---|---|
| shows the default muscle and filters strength exercises by equipment | Default selection `chest`, Strength tab, equipment filter, "Watch tutorial" links (`href`, `target=_blank`, `rel` with `noopener`), Flexibility tab |
| turns the figure around when a back-only muscle is picked from the roster | `select` + `viewForMuscle`: Back radio checked, back 2D diagram shown, detail heading updates |
| falls back to the 2D body map when WebGL is unavailable | `supportsWebGL() === false` path and its hint text |
| switches between dark gym themes and remembers the choice | `data-theme` on `<html>`, theme radio state, persistence across remounts via `localStorage` |
| credits the 3D anatomy source | Footer text and CC BY 4.0 link |
| shows an error when the API is unreachable | Rejected `fetch` shows "Can't reach the OneFit API." |

## How it works

[setup.ts](test/setup.md) stubs `HTMLCanvasElement.getContext` to return
`null`, so every test runs the 2D fallback.

## Depends on

Testing Library (`render`, `screen`, `within`, `userEvent`), Vitest.

## Used by

`npm test`.

## Tests

This is a test file.

## Gotchas / TODO

Not covered: the 3D viewer, the body profile panel inside App (it is only
rendered with WebGL; it has its own [suite](features/profile/BodyProfilePanel.test.md)),
pose mode and presets, the Look picker, hover syncing between roster and map,
the per-muscle error panel in `MuscleDetail` and its "Try again" button. The
theme test clears `localStorage` itself; other tests do not, so a failing
theme test could leak `onefit:theme` into later tests.
