# `src/hooks/useStoredState.test.ts`

## Purpose

Unit tests for [useStoredState](useStoredState.md) via `renderHook`.

## Public API

`describe('useStoredState')`:

| Test | Covers |
|---|---|
| persists values and restores them on the next mount | Write on set, read on mount (`onefit:` prefix implied) |
| ignores invalid stored values | A stored string fails `isNumber`, so the fallback is used |
| keeps working when storage throws | `getItem`/`setItem` throwing (mocked on `Storage.prototype`); functional updates still work in memory |

`localStorage` is cleared and mocks restored after each test.

## How it works

Uses jsdom's real `localStorage`.

## Depends on

Testing Library `renderHook`/`act`, Vitest.

## Used by

`npm test`.

## Tests

This is a test file.

## Gotchas / TODO

Not covered: invalid JSON in storage (the `JSON.parse` branch), changing the
`key` prop, the exact storage key format.
