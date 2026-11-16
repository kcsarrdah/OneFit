# OneFit Web — Muscle Explorer

An interactive 3D anatomy viewer: orbit a realistic muscular figure 360°, click
any muscle, and a leader line ties it to an info panel showing what it does,
gym and bodyweight exercises that strengthen it, and stretches / mobility work
that keep it flexible, each with a "Watch tutorial" link. Browsers without WebGL2
get a 2D body map instead.

Per-file documentation lives in [`docs/`](docs/README.md).

## Features

- **Muscle Explorer:** 18 muscle groups, selectable on the 3D figure, on the 2D
  map, or from the searchable roster (grouped by upper body, core, lower body).
  Picking a muscle that is not visible from the current side turns the figure.
  The detail panel has Overview (functions, coach's notes), Strength (filter by
  equipment, difficulty, sets/reps, cues) and Flexibility (static, dynamic,
  mobility) tabs.
- **Your body:** height, weight, body fat and age sliders reshape the figure.
  Weight splits into lean and fat mass, drawn separately:
  - Lean mass (FFMI) sets muscle size only.
  - Fat is its own **separate, translucent yellow layer** over the muscles
    (toggle "Layer" in the fat map), as thick as your fat mass allows and
    distributed the typical male way: belly, love handles and lower back first,
    then chest, chin, thighs and arms; little on calves and forearms. Visceral
    fat bulges the belly. Under ~2 mm the layer is invisible, so lean bodies
    show their muscles.
  - A fat map lists estimated thickness per site, BMI and FFMI with categories,
    lean and fat mass, and a guide card explains each body fat range.
  - Height scales from the feet; age adds a slight stoop and duller tone.
  - Metric or imperial; everything is remembered per browser.
- **Looks:** Hologram (glowing x-ray skeleton), Anatomy (ivory bone), Sculpt
  (clean single-tone figure). The skull is replaced by a smooth, stylised
  mannequin head in every look.
- **Pose mode (experimental):** drag an arm, leg or the torso to rotate that
  joint (with anatomical limits), or pick a preset (Relaxed, T-pose, Reach up,
  Flex, Squat, Lunge). Feet stay planted on the pedestal.
- **Themes:** dark, gym-inspired Iron (default), Volt and Steel, plus Hologram,
  with a daily motivation line.
- **Animation:** scan-line reveal on load, light sweep over the selected muscle,
  hover rim glow, eased camera turns, idle camera sway. Rendering pauses when
  the stage is off screen and drops post-processing on slow devices.

## Stack

- React 19 + TypeScript, built with Vite
- three.js via React Three Fiber + drei (camera controls, environment,
  loading) + three-mesh-bvh (picking) and postprocessing (bloom, vignette);
  lazy-loaded so it never blocks first paint
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
| `npm run preview` | Serve `dist/` (no API proxy) |
| `npm test` | Run all tests once (`npm run test:watch` to watch) |
| `npm run lint` | Lint with oxlint |
| `npm run build:model -- <pack>/package/public` | Regenerate `public/models/body.glb` (see below) |

## Layout

```
src/
  api/                 typed API client (anatomy.ts) + React Query hooks (queries.ts)
  components/ui.tsx    shared primitives (Panel, Badge, SegmentedControl)
  hooks/               useStoredState (localStorage-backed state)
  theme/themes.ts      theme colours for the 3D scene, daily motivation
  features/
    body-3d/           3D viewer (lazy chunk): BodyViewer (canvas, camera, lights,
                       leader line), BodyModel (figure, fat layer, animation, picking,
                       posing), bodyMaterials (shader patches), picking (posed BVH
                       picking, surface anchors), Platform; three-free helpers:
                       profile.ts (body maths), camera.ts, leader.ts, modelNodes.ts,
                       pose.ts / posePresets.ts, styles.ts, webgl.ts
    body-map/          2D SVG fallback: bodyPaths.ts (geometry) + BodyMap.tsx
    profile/           "Your body" panel (sliders, stats, fat map, range guide)
    roster/            searchable muscle list
    muscle-detail/     overview / strength / flexibility panel
  App.tsx              page layout and shared state
scripts/
  build-body-model.mjs model build pipeline
  lib/                 synthesize, rig, ao, fatLayer (+ rig.test.mjs)
docs/                  one doc per file (see docs/README.md)
```

## The 3D model

`public/models/body.glb` (≈3.2 MB, meshopt-compressed) is built from
[BodyParts3D](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/) (© The Database
Center for Life Science, CC BY 4.0, credited in the app footer and in
`public/models/LICENSE-BodyParts3D.txt`). To regenerate it:

```bash
npm pack @somakine/bodyparts3d-musculoskeletal@0.2.0   # ~33 MB, into a scratch dir
tar -xzf somakine-bodyparts3d-musculoskeletal-0.2.0.tgz
npm run build:model -- /path/to/package/public
```

`scripts/build-body-model.mjs`:

1. Groups the source meshes into the app's muscle ids (`MUSCLE_GROUPS`), one
   node per side named `muscle-<id>-<l|r>`; other muscles become `context`; the
   skeleton (minus the skull) is joined into one `bones` mesh.
2. Generates what BodyParts3D lacks (`scripts/lib/synthesize.mjs`): latissimus
   dorsi and rectus abdominis, by shrink-wrapping a parametric sheet over the
   surrounding ribs, spine and obliques, and a smooth mannequin `head` sized
   from the skull.
3. Rigs it (`scripts/lib/rig.mjs`): spine, shoulders, elbows, wrists, hips,
   knees, ankles; bones bind rigidly to one joint, muscles blend across the
   joints they cross.
4. Builds the subcutaneous fat layer (`scripts/lib/fatLayer.mjs`): one
   voxelized, morphologically closed envelope per body part (trunk, each arm,
   each leg), meshed with surface nets, with per-vertex distribution weights
   and the areas the app needs to turn litres of fat into millimetres.
5. Recentres (feet on y = 0), simplifies to per-node triangle budgets, bakes
   per-vertex crevice occlusion (`scripts/lib/ao.mjs`, used to separate the
   muscles visually), and quantizes and compresses everything.

Node names are a contract with the viewer: see `src/features/body-3d/modelNodes.ts`.

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

## Testing

`npm test` runs 11 suites (79 tests) with Vitest in jsdom, including
`scripts/lib/rig.test.mjs`. jsdom has no WebGL, so the app tests exercise the 2D
fallback; the 3D code is covered through its pure helpers (body maths, pose,
camera, leader line, node names) and a check of the committed GLB. Coverage,
gaps and the latest results: [`docs/tests/README.md`](docs/tests/README.md).

## Docs

Every source and test file has a doc in [`docs/`](docs/README.md), mirroring the
tree. Update the doc in the same change as the code (rule 2 in the repo's
`CLAUDE.md`).
