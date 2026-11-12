# `src/features/body-3d/webgl.ts`

## Purpose

Feature detection that decides between the 3D viewer and the 2D body map.

## Public API

`supportsWebGL(): boolean`: whether a `webgl2` context can be created. Cached
in a module variable after the first call.

## How it works

Creates a throwaway `<canvas>` and calls `getContext('webgl2')` in `try/catch`.

## Depends on

DOM.

## Used by

[App](../../App.md) (`useState(supportsWebGL)`).

## Tests

Indirectly: [setup.ts](../../test/setup.md) makes `getContext` return `null`,
so [App.test](../../App.test.md) checks the fallback.

## Gotchas / TODO

- The detection context is never released (no `WEBGL_lose_context`); it is
  created once thanks to the cache, so this costs one of the browser's limited
  WebGL contexts for the page's lifetime.
- A context that is lost later (GPU reset) is not handled; the canvas just stops.
