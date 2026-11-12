# `scripts/lib/fatLayer.mjs`

## Purpose

Builds the subcutaneous fat layer: one smooth, closed envelope per body part
around the muscles and bones, separate from them, plus a per-vertex weight for
how much of the body's fat sits there. The app thickens it with the user's fat
mass.

## Public API

| Export | Meaning |
|---|---|
| `envelope(meshes)` | `{ positions, normals, indices }` of the closed envelope around a part's geometry (`{ positions, indices }[]`) |
| `FAT_PARTS` | `['trunk', 'arm-l', 'arm-r', 'leg-l', 'leg-r']` |
| `fatLandmarks(joints, headBottomY)` | `{ hipY, shoulderY, headBottomY, joints }` for `fatWeight` |
| `fatWeight(part, p, n, landmarks)` | `{ w, visceral }`: relative thickness (1 ≈ body average) and belly-bulge weight at position `p` with outward normal `n` |
| `signedVolume(positions, indices)` | Positive for outward-facing closed meshes (used as an inside-out check) |
| `vertexNormals(positions, indices)` | Area-weighted vertex normals |

## How it works

**Envelope** (voxel size `H` = 5 mm, closing radius `R` = 12 mm, shell
correction `SHELL` = 2 mm):

1. **Splat.** Bounding box padded by `R + 4H`. Every triangle is sampled at
   half-voxel spacing (barycentric grid) and the nearest voxel marked as
   surface.
2. **Solid.** The surface is dilated by one voxel (3×3×3) so a 6-connected
   flood fill from a corner cannot slip through diagonal gaps. Everything the
   flood does not reach is solid (inside the body or a cavity).
3. **Morphological closing** via two exact Euclidean distance transforms
   (Felzenszwalb-Huttenlocher, separable, per axis): dilate the solid by `R`
   (voxels within `R` of solid), then take each voxel's depth inside that
   dilated set. The signed field `phi = depth × H - R - SHELL` (> 0 inside)
   has its zero level where an erosion by `R` would put the surface: grooves
   narrower than about `2R` (2.4 cm) between muscles are bridged, as fat fills
   them first, while convex shapes keep their size. `SHELL` pulls the surface
   back by the voxel shell's thickness so it starts snug on the muscles.
   `phi` gets two 1-2-1 blurs.
4. **Surface nets.** One vertex per grid cell that straddles `phi = 0`, at the
   average of the edge crossings; one quad per crossing grid edge, wound from
   inside to outside.
5. **Clean-up.** Keep the largest connected component (drops internal cavity
   surfaces), Taubin smoothing (12 × λ 0.5 / μ -0.53, removes voxel steps
   without shrinking), recompute normals.

Parts are meshed separately, so arms do not fuse to the torso nor thighs to
each other; they overlap at shoulders and hips, which the two-pass fat material
in [bodyMaterials](../../src/features/body-3d/bodyMaterials.md) handles.

**Distribution** (`fatWeight`, typical male pattern; `front`/`back` are
smoothsteps of the normal's z):

- Trunk: base 0.55 plus Gaussian bumps: lower belly (+2.8, front, 9 cm above
  the hips), love handles (+2.2, 15 cm lateral), lower back (+1.5, back), chest
  (+1.1, front), upper back (+0.8), buttocks (+1.2, back), under the chin
  (+1.1, front) and back of the neck (+0.5). Faded by 85% over the head.
  `visceral` is a front belly bump.
- Arms: 0.55 (+0.55 on the back) above the elbow, 0.3 on the forearm, 0.12 on
  the hand.
- Legs: 0.95 on the thigh (+0.5 inner, +0.6 outer upper thigh), +0.3 inner
  knee, 0.45 (+0.15 back) on the calf, 0.12 on the foot.

[build-body-model](../build-body-model.md) stores `w / 4` and `visceral` as
`_FATW`/`_VISC` bytes and the areas as node extras; [BodyModel](../../src/features/body-3d/BodyModel.md)
turns litres into thickness with them.

## Depends on

none (pure JS).

## Used by

[build-body-model](../build-body-model.md).

## Tests

none directly. [modelNodes.test](../../src/features/body-3d/modelNodes.test.md)
checks that the five `fat-*` nodes exist with positive areas.

## Gotchas / TODO

- The relative factors in [profile.ts](../../src/features/body-3d/profile.md)
  `FAT_SITES` (shown in the panel) are hand-matched to these weights; nothing
  checks they agree.
- Memory and time grow with the part's bounding-box volume / H³ (the trunk
  grid is roughly 1-2 million voxels, with several full-size typed arrays).
  Halving `H` costs 8×.
- Weights above 4 (`FAT_WEIGHT_MAX` in the build script) are clipped when
  stored as a byte; raising a bump's amplitude can hit that silently.
- `vertexNormals` is duplicated in [synthesize.mjs](synthesize.md).
