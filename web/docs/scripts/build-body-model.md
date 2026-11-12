# `scripts/build-body-model.mjs`

## Purpose

Offline pipeline that builds `public/models/body.glb` (≈3.2 MB) from the
BodyParts3D data pack: muscle grouping, synthesized muscles and head, rig and
skin weights, the subcutaneous fat layer, simplification, baked crevice
occlusion, and meshopt compression.

## Public API

CLI (also `npm run build:model -- <dir>`):

```bash
npm pack @somakine/bodyparts3d-musculoskeletal@0.2.0   # ~33 MB, in a scratch dir
tar -xzf somakine-bodyparts3d-musculoskeletal-0.2.0.tgz
node scripts/build-body-model.mjs /path/to/package/public
```

- Input: `<dir>/pack.json` (`structures`, `meshInstances`, `assets`) and the
  regional GLBs it lists. Assets whose URI matches `connective` are skipped.
- Output: `web/public/models/body.glb`, overwritten. Logs bounds, triangle
  count, fat areas, joint positions, size and node list.
- `PROBE=slug1,slug2 node scripts/build-body-model.mjs <dir>`: print the
  bounding box of each source structure and exit (for finding landmarks).
- `MUSCLE_GROUPS`: BodyParts3D structure slug → app muscle id (must exist in
  `backend/data/muscles.json`). Unlisted muscles become `context`.

Output nodes follow the contract in [modelNodes.ts](../src/features/body-3d/modelNodes.md).

## How it works

1. **Collect.** Each source GLB is merged into one `Document`; each mesh node's
   world transform (source is Z-up millimetres) is baked into its primitives,
   which become Y-up metres. Primitives are grouped by output name: bones →
   `bones` (skull bones, `SKULL_SLUGS`, dropped), muscles →
   `muscle-<id>-<l|r|c>` or `context`. Side comes from `meshInstances`
   laterality, falling back to the name suffix (`…M` = left). Every primitive
   is also indexed by slug (`bySlug`) for landmarks.
2. **Synthesize** ([synthesize.mjs](lib/synthesize.md)): a radius field from
   ribs, spine, pelvis, obliques, serratus, erectors, scapula and teres major;
   then `muscle-lats-l/r` (with a hard-coded humerus insertion
   `[0.163, 1.258, 0.082]`), `muscle-abs-l/r`, and the `head` shell sized from
   the skull.
3. **Check sides.** Throws unless `muscle-delts-l` lies on +X (body's left).
4. **Rig** ([rig.mjs](lib/rig.md)): joint positions from bone landmarks; then
   `JOINTS_0`/`WEIGHTS_0` on every primitive while its type is still known:
   bones rigidly to one joint (`boneJoint`), muscles smoothly by `muscleHint`,
   context by `contextHint`; generated muscles by their id.
5. **Fat layer** ([fatLayer.mjs](lib/fatLayer.md)): every non-skull primitive
   is assigned to a part (`trunk`, `arm-l/r`, `leg-l/r`; hands and feet
   excluded) by bone joint, muscle hint, or for context muscles by where
   `vertexWeights` puts them; generated muscles and the head go to the trunk.
   Each part becomes an `envelope` (throws if inside out), with per-vertex
   `fatWeight` stored as `_FATW` (weight ÷ 4, normalised byte) and `_VISC`
   (normalised byte), and is skinned with hint `auto`/`arm`/`leg`.
6. **Join** each group into one node with one primitive (one draw call).
7. **Recentre**: feet (lowest non-fat vertex) at y = 0, centred on x/z.
8. **Simplify**: `unpartition`, `prune`, `dedup`, `weld`, then
   `simplifyPrimitive` (meshoptimizer, error 0.01) to triangle budgets: bones
   60k, context 9k, `fat-trunk` 16k, other fat 5k, everything else 7k.
9. **Ambient occlusion** ([ao.mjs](lib/ao.md)) on all non-fat nodes, stored as
   `_AO` (normalised byte).
10. **Fat areas**: per fat node, `area`, `weightedArea = Σ area × weight`,
    `visceralArea = Σ area × visc` and `weightMax = 4`, written to node
    `extras`. The app divides a fat volume by `weightedArea` to get thickness.
11. **Skeleton**: `joint-<name>` nodes in the `JOINTS` hierarchy (translations
    relative to the parent, shifted by the recentring offset), one skin with
    inverse bind matrices = negated world translation (no bind rotation), bound
    to every mesh node.
12. **Write**: `prune`, `quantize` (folded into the inverse bind matrices for
    skinned meshes), required `EXT_meshopt_compression` (FILTER method).

## Depends on

`@gltf-transform/core|extensions|functions`, `meshoptimizer`, and
[lib/synthesize](lib/synthesize.md), [lib/rig](lib/rig.md),
[lib/ao](lib/ao.md) (three + three-mesh-bvh), [lib/fatLayer](lib/fatLayer.md).

## Used by

Developers, by hand, when the model changes. The output is committed.

## Tests

[rig.test](lib/rig.test.md) covers the rig helpers;
[modelNodes.test](../src/features/body-3d/modelNodes.test.md) validates the
committed output (node names, skins, fat extras, muscle coverage). The script
itself has no tests and is not run in CI.

## Gotchas / TODO

- 453 lines in one top-level script; steps 5 and 10 could live in `fatLayer.mjs`.
- The AO comment ("the app deepens it at low body fat") is stale: the shader
  now applies crevice shading at a fixed strength (see
  [bodyMaterials](../src/features/body-3d/bodyMaterials.md)).
- `HUMERUS_INSERTION` and the landmark heights in `synthesize.mjs` are
  hard-coded for this source model.
- `README.md` previously said the model was ≈2.6 MB; it is 3.2 MB since the fat
  layer.
- The fat layer step dominates run time (logged as "fat layer built in N s").
