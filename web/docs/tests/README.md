# Web tests

## How to run

```bash
cd web
npm test              # vitest run (all suites once)
npm run test:watch    # watch mode
npx vitest run src/features/body-3d/profile.test.ts   # one file
npm run lint          # oxlint
npm run build         # tsc -b type-check + production build
```

Vitest runs in `jsdom` with [`src/test/setup.ts`](../src/test/setup.md)
(jest-dom matchers, cleanup, and `getContext()` returning `null`, i.e. no
WebGL). The default include pattern also picks up `scripts/lib/*.test.mjs`.
Two suites read files outside `src/`: `backend/data/muscles.json` and
`public/models/body.glb`, so run them from a full checkout.

## Last run

2026-11-12, on branch `docs/web` (code identical to `feat/web-muscle-explorer`):

| | Result |
|---|---|
| `npm test` | **11 files, 79 tests, all passed** (≈2.6 s) |
| `npm run lint` | no findings |
| `npx tsc -b` | no errors |
| `npm run build` | OK; `index` chunk 292 kB (92 kB gzip), lazy `BodyViewer` chunk 1,249 kB (340 kB gzip), CSS 38 kB |

## Suites

| Suite | Tests | Covers | Notably not covered |
|---|---|---|---|
| [App.test](../src/App.test.md) | 6 | Default muscle, tabs, equipment filter, tutorial links, roster turning the figure, 2D fallback, theme switch + persistence, credits, API error | Anything 3D; pose mode; Look picker; per-muscle error/retry |
| [BodyMap.test](../src/features/body-map/BodyMap.test.md) | 4 | Click on either half, one accessible button per muscle, keyboard select, 2D figures match backend views | Hover/focus callbacks |
| [BodyProfilePanel.test](../src/features/profile/BodyProfilePanel.test.md) | 5 | Sliders update values/BMI/category, body fat bands and composition, fat map growth and layer switch, units, reset | Slider CSS variables, FFMI text |
| [profile.test](../src/features/body-3d/profile.test.md) | 15 | BMI, `bodyShape`, `clampProfile`, composition/FFMI, bands, fat stores, site thickness, formatting | Agreement of `FAT_SITES` with the baked fat weights |
| [modelNodes.test](../src/features/body-3d/modelNodes.test.md) | 10 | Node-name parser; the committed GLB: skins, node names, head, fat nodes and areas, muscle coverage vs backend | Geometry and custom attributes |
| [pose.test](../src/features/body-3d/pose.test.md) | 8 | Presets within limits, arm mirroring, squat directions, rest identity, joint limits and mirroring, quaternion clamp, drag joint lookup | The drag interaction |
| [camera.test](../src/features/body-3d/camera.test.md) | 12 | Azimuth wrapping, side detection, shortest turn, side for a muscle, focus height | |
| [leader.test](../src/features/body-3d/leader.test.md) | 6 | Leader geometry left/right, header entry, null cases, SVG formatting | Projection and occlusion |
| [themes.test](../src/theme/themes.test.md) | 3 | Hex colours, id validation, daily motivation | Inherited-key ids (a real bug), CSS/TS colour agreement |
| [useStoredState.test](../src/hooks/useStoredState.test.md) | 3 | Persist/restore, invalid values, storage throwing | Invalid JSON, key changes |
| [rig.test](../scripts/lib/rig.test.md) | 7 | `boneJoint`, `vertexWeights` (sum, elbow split, side, torso), rigid skinning | `computeJoints`, `auto` hint |

## Gaps

- **No 3D rendering tests.** `BodyViewer`, `BodyModel`, `bodyMaterials`,
  `picking` and `Platform` need WebGL; jsdom has none. Their pure helpers are
  tested. A browser runner (e.g. Vitest browser mode or Playwright) would be
  needed for the rest.
- **Build pipeline.** `build-body-model.mjs`, `synthesize.mjs`, `ao.mjs` and
  `fatLayer.mjs` have no unit tests; the committed output is checked by
  `modelNodes.test`.
- `MuscleRoster` search, `api/anatomy.ts` error parsing and `queries.ts` are
  only exercised through `App.test`.
