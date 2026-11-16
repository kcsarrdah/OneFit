# `src/test/setup.ts`

## Purpose

Vitest setup file (configured in [vite.config](../../vite.config.md)).

## Public API

none (side effects):

- Imports `@testing-library/jest-dom/vitest` (matchers like `toBeInTheDocument`).
- Replaces `HTMLCanvasElement.prototype.getContext` with `() => null`, so the app
  behaves like a browser without WebGL (2D fallback) instead of jsdom logging
  "not implemented".
- Runs Testing Library's `cleanup()` after each test.

## How it works

See above.

## Depends on

`@testing-library/jest-dom`, `@testing-library/react`, Vitest.

## Used by

Every Vitest suite, including `scripts/lib/rig.test.mjs`.

## Tests

none.

## Gotchas / TODO

- Because of the stub, no test can exercise the 3D viewer. Testing it would
  need a separate environment (e.g. a browser runner) or mocking
  `supportsWebGL`.
- `supportsWebGL` caches its result in a module variable, so changing the stub
  inside a test file after the first call has no effect.
