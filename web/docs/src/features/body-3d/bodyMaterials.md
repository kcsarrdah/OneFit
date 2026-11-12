# `src/features/body-3d/bodyMaterials.ts`

## Purpose

All materials on the figure, built by patching three's standard/physical
shaders: intro reveal, lean-mass inflation, crevice shading, age
desaturation, selection sweep, hover rim, per-look palettes, and the separate
translucent fat layer.

## Public API

**Figure materials**

| Export | Meaning |
|---|---|
| `SharedUniforms` / `createSharedUniforms()` | One set per figure: `uReveal` (world Y above which nothing is drawn yet; starts -1), `uEdgeColor` (reveal edge glow), `uInflate` (metres along normals, lean mass), `uDesat` (0..1, age) |
| `MaterialUniforms` (on `material.userData.u`) | Per material: `uSweep` (world Y of the selection light band), `uSweepAmount`, `uSweepColor`, `uRim` (fresnel strength), `uRimColor`, `uShape` (how much `uInflate` applies), `uComposition` (how much crevice shading applies) |
| `FigureMaterial` | `(MeshStandardMaterial \| MeshPhysicalMaterial) & { userData: { u: MaterialUniforms } }` |
| `StylePalette`, `paletteFor(style, accent, accentDeep)` | Colours per look (`muscle`, `dim`, `context`, `hover`, `selected`, `selectedEmissive`, `hoverEmissive`, `hoverRim`, `desaturates`); selection colours replaced by the theme's accent |
| `createMuscleMaterial(style, shared)` | `MeshPhysicalMaterial` with clearcoat (wet sheen); `uShape = 1` |
| `createContextMaterial(style, shared)` | Non-selectable muscles; `uShape = 1` |
| `createBoneMaterial(style, shared, accent)` | Hologram: black, additive, transparent, lit only by an accent fresnel rim (x-ray look); Sculpt: grey clay; Anatomy: ivory. `uShape = 0` |
| `createHeadMaterial(style, shared, accent)` | Mannequin head per look; `uShape = 0.5` |
| `BodyStyle` | Re-exported from [styles](styles.md) |

**Fat layer**

| Export | Meaning |
|---|---|
| `FatUniforms` / `createFatUniforms()` | `uFatScale` (metres of fat per unit of baked `_FATW` weight), `uVisc` (metres of belly bulge per unit of `_VISC`), `uFatOpacity` (0..1 toggle fade) |
| `createFatMaterials(shared, fat)` | `{ depth, color }`: a depth-only pre-pass and the translucent colour pass |

**Vertex attributes read** (custom glTF attributes `_AO`, `_FATW`, `_VISC`
arrive in three as `_ao`, `_fatw`, `_visc`; all normalised bytes 0..1):

- `_ao`: baked crevice openness (1 = open), muscles/bones/head/context
  ([ao.mjs](../../../scripts/lib/ao.md)).
- `_fatw`: fat distribution weight ÷ 4 (`FAT_WEIGHT_MAX`), fat envelopes only.
- `_visc`: visceral bulge weight, fat envelopes only.

## How it works

`patch()` sets `onBeforeCompile` to merge the shared and per-material uniforms
and splice GLSL into three's chunks:

| Chunk replaced | Injected |
|---|---|
| `#include <skinning_vertex>` (vertex) | After skinning: `transformed += normalize(objectNormal) * uInflate * uShape`; pass world position (`vBodyPos`) and `_ao` (`vOpen`) |
| `#include <clipping_planes_fragment>` | `if (vBodyPos.y > uReveal) discard;` (bottom-up reveal) |
| `#include <color_fragment>` | Desaturate toward luma by `uDesat`; darken grooves: `groove = smoothstep(0.12, 0.8, 1 - vOpen)`, colour `*= 1 - 0.7 × groove × uComposition` |
| `#include <emissivemap_fragment>` | Add: reveal edge glow (4.5 cm band under `uReveal`, ×3), selection sweep (`exp(-((y - uSweep) / 0.04)²)`, a band a few cm tall, × `uSweepAmount`), fresnel rim (`pow(1 - |n·v|, 2.4) × uRim`) |

`customProgramCacheKey` returns `'onefit-body'` so all figure materials share
one compiled program per material type; each still gets its own uniform
objects because `onBeforeCompile` runs per material.

**Fat layer.** Each fat envelope is drawn twice (see [BodyModel](BodyModel.md)):
first with `depth` (`colorWrite: false`, polygon offset 1/1, render order 20),
then with `color` (`depthWrite: false`, render order 21). The pre-pass fills
the depth buffer with the nearest fat surface, so the colour pass only draws
that surface once. Overlapping envelopes (shoulders, hips) therefore do not
double their opacity, and the muscles stay visible through the film. The fat
vertex shader pushes each vertex out by `uInflate + thick`, where
`thick = uFatScale × _fatw + uVisc × _visc`, so the envelope rides on top of the
lean-mass inflation and then grows by the local fat thickness. The fragment
colour runs from pale cream to deep amber with
`fatT = smoothstep(2 mm, 35 mm, thick)`; alpha is
`mix(0.1, 0.72, fatT) + 0.22 × rim`, capped at 0.85, multiplied by
`present = smoothstep(2 mm, 7 mm, thick)` (thin fat is invisible, so lean
bodies show their muscles) and by `uFatOpacity`.

## Depends on

three, [styles](styles.md).

## Used by

[BodyModel](BodyModel.md).

## Tests

none (shader code needs WebGL).

## Gotchas / TODO

- Replacing `#include` strings relies on three's chunk names; a three.js
  upgrade that renames `skinning_vertex`, `color_fragment`,
  `emissivemap_fragment`, `clipping_planes_fragment` or `opaque_fragment`
  silently drops the effect (no error).
- `uComposition` is fixed per material (1 when `uShape > 0`), so crevice
  shading no longer varies with body fat. The comments in
  [build-body-model](../../../scripts/build-body-model.md) and
  [ao.mjs](../../../scripts/lib/ao.md) saying the app "deepens it at low body
  fat" are stale since the fat layer was split out.
- `uSweepColor` (`#bffff3`) and the default rim colours are fixed, not themed.
- The fat colour and `present` thresholds are in metres of shader thickness,
  which is `uFatScale × _fatw`, not the millimetres shown in the panel's fat
  map (those come from [profile](profile.md) `FAT_SITES`).
