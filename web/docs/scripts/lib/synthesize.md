# `scripts/lib/synthesize.mjs`

## Purpose

Generates geometry BodyParts3D does not provide: latissimus dorsi, rectus
abdominis, and a smooth mannequin head that replaces the skull.

## Public API

| Export | Meaning |
|---|---|
| `WRAP_SLUGS: RegExp[]` | Source structures the generated sheets rest on (ribs, thoracic/lumbar vertebrae, sacrum, hip bone, external oblique, serratus anterior, erector spinae, scapula, teres major) |
| `buildRadiusField(positionArrays)` | Returns `radius(theta, y)`: outer trunk radius around a vertical axis at z = 0.1 m |
| `latissimusDorsi(radius, sign, humerusInsertion)` | `{ positions, normals, indices }` for one side (`sign` +1 = left/+X) |
| `rectusAbdominis(radius, sign)` | Same, with six-pack grooves |
| `SKULL_SLUGS: RegExp` | Skull bones dropped from `bones` |
| `headShell(positionArrays)` | Closed egg-shaped head mesh from the skull's bounds |

All coordinates are metres, Y up, facing +Z, body's left on +X.

## How it works

**Radius field.** Over y = 0.74-1.42 m in 5 mm rows and θ in 2° steps, keep
the largest radius of any wrap-structure vertex. Empty cells in each row are
interpolated around the circle (the front of the abdomen has no source
geometry), then the field is dilated 3× (so smoothing cannot sink below bony
peaks) and box-blurred 10×. Lookups are bilinear.

**Shrink-wrapped sheets.** `gridMesh` evaluates a parametric `(u, v)` patch and
triangulates it, flipping the winding if the middle normal points toward the
axis. Each point is `onSurface(radius, θ, y, thickness)`:

- Lats (56 × 60): from just lateral of the spine (9-14°) to the side
  (98-104°), lower border along the iliac crest (~0.96-0.99 m), upper border
  rising to the armpit (~1.20-1.26 m). Thickness 2 mm plus up to 9 mm of belly
  laterally, with fibre ridges; the top-lateral corner converges 85% of the
  way to the humerus insertion.
- Rectus abdominis (18 × 56): 0.875-1.175 m tall, 6 mm from the midline
  (linea alba gap), widening from 32 to 78 mm; three tendinous intersections at
  v = 0.5, 0.7, 0.87 thin the sheet by 45%.

**Head.** An ellipsoid fitted to the skull bounds plus 6 mm of tissue (narrower
in x and z), narrowing toward the chin, with a soft nose and brow bump, tilted
0.1 rad so the chin comes forward; `gridMeshClosed` (72 × 48) wraps in u and
orients normals outward from the centroid.

## Depends on

none (pure JS).

## Used by

[build-body-model](../build-body-model.md).

## Tests

none. The output is checked indirectly by
[modelNodes.test](../../src/features/body-3d/modelNodes.test.md)
(`muscle-lats-*`, `muscle-abs-*`, `head` exist).

## Gotchas / TODO

- Landmark heights (`Y0`, `Y1`, lats and abs borders) are absolute metres for
  this source model; a different pack needs them re-measured (use `PROBE`).
- `vertexNormals` is duplicated in [fatLayer.mjs](fatLayer.md).
