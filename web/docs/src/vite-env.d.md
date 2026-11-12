# `src/vite-env.d.ts`

## Purpose

Ambient types: Vite's client types plus the app's env variables.

## Public API

`interface ImportMetaEnv { readonly VITE_API_BASE_URL?: string }`: absolute API
origin for deployed builds; empty in dev, where Vite proxies `/api`.

## How it works

Declaration merging with `vite/client`.

## Depends on

`vite/client`.

## Used by

[api/anatomy.ts](api/anatomy.md) (`import.meta.env.VITE_API_BASE_URL`).

## Tests

none.

## Gotchas / TODO

- `VITE_API_TARGET` (dev proxy target) is read by [vite.config](../vite.config.md)
  from `process.env`, not `import.meta.env`, so it is not declared here.
