# OneFit Web — Muscle Explorer

An interactive body map: click any muscle (front or back) to see what it does,
gym and bodyweight exercises that strengthen it, and stretches / mobility work
that keep it flexible.

## Stack

- React 19 + TypeScript, built with Vite
- Tailwind CSS v4 (theme tokens in `src/index.css`)
- TanStack Query for data fetching and caching
- Vitest + Testing Library for tests, oxlint for linting

## Running locally

The web app reads from the Go backend in `../backend`, so start that first:

```bash
cd backend && go run .
```

Then, in another terminal:

```bash
cd web && npm install && npm run dev
```

Open http://localhost:5173. In dev, Vite proxies `/api/*` to `http://localhost:3000`
(override with `VITE_API_TARGET`), so no CORS setup is needed. For a deployed build,
set `VITE_API_BASE_URL` to the API origin.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Typecheck (`tsc -b`) and production build to `dist/` |
| `npm test` | Run tests once (`npm run test:watch` to watch) |
| `npm run lint` | Lint with oxlint |

## Layout

```
src/
  api/                 typed API client (anatomy.ts) + React Query hooks (queries.ts)
  components/ui.tsx    shared primitives (Panel, Badge, SegmentedControl)
  features/
    body-map/          SVG figure: bodyPaths.ts (geometry) + BodyMap.tsx
    roster/            searchable muscle list
    muscle-detail/     overview / strength / flexibility panel
  App.tsx              page layout and selection state
```

## Content and drawing

Muscle content (names, exercises, stretches) lives in the backend at
`backend/data/muscles.json` and is served by `GET /api/anatomy/muscles[/:id]`.

The figure in `features/body-map/bodyPaths.ts` is drawn for the viewer's left half
only and mirrored across the centre line. To add a muscle:

1. Add it to `backend/data/muscles.json` with the `views` it appears on.
2. Add its path(s) to the matching figure(s) in `bodyPaths.ts` using the same `id`.

A test in `BodyMap.test.tsx` fails if the two disagree.
