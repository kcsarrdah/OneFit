# OneFit Web docs

One Markdown file per source and test file in `web/`, mirroring the tree
(`src/features/body-3d/BodyModel.tsx` → `docs/src/features/body-3d/BodyModel.md`).
Code extensions are dropped (`.ts`, `.tsx`, `.mjs`); other files keep theirs
(`index.css` → `index.css.md`, `index.html` → `index.html.md`;
`.oxlintrc.json` → `oxlintrc.md`). Every doc follows [`_TEMPLATE.md`](_TEMPLATE.md).
Test coverage and how to run the suites: [`tests/README.md`](tests/README.md).

## Architecture

```
backend (Go, :3000)                       web (React 19 + Vite, :5173)
GET /api/anatomy/muscles      ──fetch──▶  api/anatomy.ts ─▶ api/queries.ts (React Query, cached forever)
GET /api/anatomy/muscles/:id                                    │
                                                                ▼
                       App.tsx: selection, hover, side, profile, look, theme, mode, pose
          ┌──────────────────┬───────────────────────┬────────────────────────┐
   BodyProfilePanel     MuscleRoster          stage: BodyViewer (lazy)     MuscleDetail
   (profile.ts maths)                          or BodyMap (no WebGL)       (leader line target)
```

**Data flow.** The muscle list (18 muscles from `backend/data/muscles.json`)
loads once via `useMuscles`; each selected muscle's detail via `useMuscle(id)`.
Both are cached for the session. `App` owns all cross-panel state; the body
profile, units, fat toggle, look and theme persist in `localStorage` through
[`useStoredState`](src/hooks/useStoredState.md) (`onefit:*` keys). The profile is
turned into a `BodyShape` by [`profile.ts`](src/features/body-3d/profile.md),
which the 3D figure eases toward every frame.

**The lazy 3D chunk.** `App` imports `BodyViewer` with `React.lazy`, so three.js,
R3F, drei, postprocessing and three-mesh-bvh (≈1.25 MB, 340 kB gzip) load only
when WebGL2 is available ([`webgl.ts`](src/features/body-3d/webgl.md)) and after
first paint. Modules the page needs without three.js are kept separate on
purpose: `camera.ts`, `posePresets.ts`, `profile.ts`, `styles.ts`, `webgl.ts`.
`BodyModel` preloads `public/models/body.glb` (meshopt-compressed, ≈3.2 MB) as
soon as the chunk loads.

**The GLB naming contract.** [`modelNodes.ts`](src/features/body-3d/modelNodes.md)
defines how node names in `body.glb` map to roles: `muscle-<id>-<l|r|c>`,
`context`, `bones`, `head`, `fat-<part>`, `joint-<name>`. The build script
writes them, `BodyModel` reads them, and
[`modelNodes.test`](src/features/body-3d/modelNodes.test.md) checks the committed
model against the parser and the backend's muscle ids. Muscle ids must agree in
three places: `backend/data/muscles.json`, `MUSCLE_GROUPS` in
[`build-body-model.mjs`](scripts/build-body-model.md), and the 2D figures in
[`bodyPaths.ts`](src/features/body-map/bodyPaths.md).

**3D rendering in one paragraph.** Every figure material is a patched three.js
standard/physical material ([`bodyMaterials.ts`](src/features/body-3d/bodyMaterials.md)):
the vertex shader inflates muscles along their normals by lean mass, the
fragment shader adds the intro reveal, crevice shading from baked AO, age
desaturation, the selection light sweep and hover rim. The fat layer is a
separate set of skinned envelopes drawn in two passes (depth, then translucent
colour) and thickened in the vertex shader by
`fat volume × baked weight / weighted area`. Picking raycasts BVH proxies of
the posed meshes ([`picking.ts`](src/features/body-3d/picking.md)); the leader
line follows a barycentric `SurfaceAnchor` and is drawn into a portalled SVG
each frame ([`BodyViewer`](src/features/body-3d/BodyViewer.md)).

## Index

### Root config

- [index.html.md](index.html.md): HTML entry, default `data-theme="iron"`, fonts.
- [vite.config.md](vite.config.md): dev proxy `/api` → `:3000`, chunk size limit, Vitest config.
- [oxlintrc.md](oxlintrc.md): lint rules; immutability rule off in `body-3d/`.

### `src/`

- [main.md](src/main.md): entry; QueryClient and StrictMode.
- [App.md](src/App.md): page layout and all cross-panel state.
- [App.test.md](src/App.test.md): integration tests with a mocked API (2D path).
- [index.css.md](src/index.css.md): Tailwind tokens, four themes, slider/map/animation styles.
- [vite-env.d.md](src/vite-env.d.md): `VITE_API_BASE_URL` type.

### `src/api/`

- [anatomy.md](src/api/anatomy.md): typed fetch client and the backend endpoints.
- [queries.md](src/api/queries.md): React Query options and hooks.

### `src/components/`

- [ui.md](src/components/ui.md): `Panel`, `Badge`, `SegmentedControl`.

### `src/hooks/`

- [useStoredState.md](src/hooks/useStoredState.md): `useState` persisted to `localStorage`.
- [useStoredState.test.md](src/hooks/useStoredState.test.md): persistence, invalid values, blocked storage.

### `src/theme/`

- [themes.md](src/theme/themes.md): theme colours for the 3D scene, daily motivation.
- [themes.test.md](src/theme/themes.test.md): colours, id validation, motivation.

### `src/test/`

- [setup.md](src/test/setup.md): jest-dom, cleanup, no-WebGL stub.

### `src/features/body-3d/`

- [BodyViewer.md](src/features/body-3d/BodyViewer.md): canvas, camera, lights, leader line, loading, idle sway.
- [BodyModel.md](src/features/body-3d/BodyModel.md): the figure: materials, fat layer, per-frame animation, picking, posing.
- [bodyMaterials.md](src/features/body-3d/bodyMaterials.md): shader patches, palettes, fat layer materials.
- [picking.md](src/features/body-3d/picking.md): `PosedPicker` and `SurfaceAnchor`.
- [profile.md](src/features/body-3d/profile.md): composition, FFMI, fat stores, site thickness, `BodyShape`.
- [profile.test.md](src/features/body-3d/profile.test.md): body maths tests.
- [pose.md](src/features/body-3d/pose.md): joint limits, pose quaternions, drag joint.
- [pose.test.md](src/features/body-3d/pose.test.md): presets and limits tests.
- [posePresets.md](src/features/body-3d/posePresets.md): posable joints and presets (no three.js).
- [camera.md](src/features/body-3d/camera.md): azimuth and focus helpers.
- [camera.test.md](src/features/body-3d/camera.test.md): camera helper tests.
- [leader.md](src/features/body-3d/leader.md): leader line geometry.
- [leader.test.md](src/features/body-3d/leader.test.md): leader geometry tests.
- [modelNodes.md](src/features/body-3d/modelNodes.md): GLB node naming contract.
- [modelNodes.test.md](src/features/body-3d/modelNodes.test.md): parser tests and GLB validation.
- [Platform.md](src/features/body-3d/Platform.md): pedestal.
- [styles.md](src/features/body-3d/styles.md): the three looks (no three.js).
- [webgl.md](src/features/body-3d/webgl.md): WebGL2 detection.

### `src/features/body-map/`

- [BodyMap.md](src/features/body-map/BodyMap.md): 2D SVG fallback, mirrored halves.
- [BodyMap.test.md](src/features/body-map/BodyMap.test.md): clicks, keyboard, backend agreement.
- [bodyPaths.md](src/features/body-map/bodyPaths.md): SVG geometry.

### `src/features/muscle-detail/`

- [MuscleDetail.md](src/features/muscle-detail/MuscleDetail.md): overview, strength, flexibility, tutorials.

### `src/features/profile/`

- [BodyProfilePanel.md](src/features/profile/BodyProfilePanel.md): sliders, stats, fat map, range guide.
- [BodyProfilePanel.test.md](src/features/profile/BodyProfilePanel.test.md): panel tests.

### `src/features/roster/`

- [MuscleRoster.md](src/features/roster/MuscleRoster.md): searchable muscle list.

### `scripts/`

- [build-body-model.md](scripts/build-body-model.md): builds `public/models/body.glb` from BodyParts3D.

### `scripts/lib/`

- [synthesize.md](scripts/lib/synthesize.md): generated lats, abs and mannequin head.
- [rig.md](scripts/lib/rig.md): joints and skin weights.
- [rig.test.md](scripts/lib/rig.test.md): rig tests.
- [ao.md](scripts/lib/ao.md): baked crevice occlusion.
- [fatLayer.md](scripts/lib/fatLayer.md): voxel closing + surface nets envelopes, fat distribution.

### Other

- [tests/README.md](tests/README.md): how to run, last results, coverage and gaps.
- [_TEMPLATE.md](_TEMPLATE.md): doc template.

Not documented separately: `package.json` (scripts are listed in
[`../README.md`](../README.md)), `tsconfig*.json` (standard Vite setup; the app
config excludes tests, `tsconfig.test.json` adds Node types for them), and
`public/` assets.

## Keeping docs up to date

Rule 2 of the repository's `CLAUDE.md` applies to every change in `web/`:

- In the **same change** as the code: create the doc for a new file, update the
  doc of every file you touch, delete the doc of a removed file, and update
  this index.
- Follow [`_TEMPLATE.md`](_TEMPLATE.md): purpose, public API, how it works,
  depends on, used by, tests, gotchas.
- Test docs say what each suite covers **and what it does not**; refresh the
  "Last run" table in [`tests/README.md`](tests/README.md) when suites change.
- Never copy secrets into docs.
