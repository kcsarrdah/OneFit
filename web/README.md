# OneFit Web — Muscle Explorer

An interactive 3D anatomy viewer: orbit a realistic muscular figure 360°, click
any muscle, and a leader line ties it to an info panel showing what it does,
gym and bodyweight exercises that strengthen it, and stretches / mobility work
that keep it flexible. Browsers without WebGL get a 2D body map instead.

## Stack

- React 19 + TypeScript, built with Vite
- three.js via React Three Fiber + drei (camera controls, BVH picking) and
  postprocessing (bloom); lazy-loaded so it never blocks first paint
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
| `npm run build:model -- <pack>/package/public` | Regenerate `public/models/body.glb` (see below) |

## Layout

```
src/
  api/                 typed API client (anatomy.ts) + React Query hooks (queries.ts)
  components/ui.tsx    shared primitives (Panel, Badge, SegmentedControl)
  features/
    body-3d/           3D viewer: BodyViewer (scene, camera, leader line), BodyModel
                       (picking, highlight animation), Platform, pure helpers
                       (camera.ts, leader.ts, modelNodes.ts) with unit tests
    body-map/          2D SVG fallback: bodyPaths.ts (geometry) + BodyMap.tsx
    roster/            searchable muscle list
    muscle-detail/     overview / strength / flexibility panel
  App.tsx              page layout and selection state
```

## The 3D model

`public/models/body.glb` (≈2.6 MB) is built from [BodyParts3D](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/)
(© The Database Center for Life Science, CC BY 4.0, credited in the app footer and in
`public/models/LICENSE-BodyParts3D.txt`). To regenerate it:

```bash
npm pack @somakine/bodyparts3d-musculoskeletal@0.2.0   # ~33 MB, into a scratch dir
tar -xzf somakine-bodyparts3d-musculoskeletal-0.2.0.tgz
npm run build:model -- /path/to/package/public
```

`scripts/build-body-model.mjs` groups the source meshes into the app's muscle ids
(`MUSCLE_GROUPS`), one node per side named `muscle-<id>-<l|r>`, joins the skeleton into
one `bones` mesh, and simplifies and compresses everything. BodyParts3D has no
latissimus dorsi or rectus abdominis, so `scripts/lib/synthesize.mjs` generates them by
shrink-wrapping a parametric sheet over the surrounding ribs, spine and obliques.

## Content and drawing

Muscle content (names, exercises, stretches) lives in the backend at
`backend/data/muscles.json` and is served by `GET /api/anatomy/muscles[/:id]`.

The 2D fallback figure in `features/body-map/bodyPaths.ts` is drawn for the viewer's
left half only and mirrored across the centre line. To add a muscle:

1. Add it to `backend/data/muscles.json` with the `views` it appears on.
2. Map its BodyParts3D structures to the id in `MUSCLE_GROUPS` and rebuild the model.
3. Add its path(s) to the matching figure(s) in `bodyPaths.ts` for the 2D fallback.

Tests in `modelNodes.test.ts` and `BodyMap.test.tsx` fail if the model, the 2D map and
the backend content disagree.
