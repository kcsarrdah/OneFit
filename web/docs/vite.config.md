# `vite.config.ts`

## Purpose

Vite build, dev server and Vitest configuration for the web app.

## Public API

Default export `defineConfig({...})`:

| Key | Value | Why |
|---|---|---|
| `plugins` | `react()`, `tailwindcss()` | React Fast Refresh; Tailwind v4 via its Vite plugin (tokens in [`src/index.css`](src/index.css.md)) |
| `server.port` | `5173` | |
| `server.proxy['/api']` | `VITE_API_TARGET` or `http://localhost:3000`, `changeOrigin: true` | The browser talks to one origin in dev, so the Go backend needs no CORS |
| `build.chunkSizeWarningLimit` | `1400` (kB) | The lazy `BodyViewer` chunk (three.js, drei, postprocessing) is ~1.25 MB raw / ~340 kB gzip and would otherwise warn |
| `test.environment` | `jsdom` | Component tests |
| `test.setupFiles` | `./src/test/setup.ts` | See [setup](src/test/setup.md) |
| `test.css` | `false` | CSS is not processed in tests |

## How it works

`VITE_API_TARGET` is read from `process.env` when the config loads (dev server
only). Production builds use `VITE_API_BASE_URL` instead (see
[`src/api/anatomy.ts`](src/api/anatomy.md)). Vitest's default include pattern
also matches `scripts/lib/*.test.mjs`, so the build-script tests run with
`npm test`.

## Depends on

`vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `vitest/config` (types only).

## Used by

`npm run dev`, `npm run build`, `npm run preview`, `npm test`.

## Tests

none (every suite runs through it).

## Gotchas / TODO

- No `preview.proxy`, so `npm run preview` cannot reach the API unless
  `VITE_API_BASE_URL` was set at build time.
- The comment in the file says the 3D chunk is "~335 kB gzipped"; the build
  measured on 2026-11-12 was 340 kB.
