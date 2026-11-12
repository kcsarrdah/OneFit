# `scripts/lib/ao.mjs`

## Purpose

Bakes short-range ambient occlusion per vertex ("how open is this point"),
which the app uses to darken the grooves between muscles so each reads as a
separate shape.

## Public API

`bakeAmbientOcclusion(meshes: { positions, normals, indices }[]): Float32Array[]`:
per mesh, per vertex openness in 0..1 (1 = fully open). Meshes must be in one
shared world space.

## How it works

1. Concatenates all meshes into one `BufferGeometry` and builds one
   `three-mesh-bvh` `MeshBVH`, so neighbouring muscles occlude each other.
2. Builds 16 fixed, cosine-weighted hemisphere directions around +Z using the
   golden angle.
3. For each vertex: build a tangent frame around its normal, offset the origin
   1.5 mm along the normal, cast the 16 rays (`raycastFirst`, double-sided,
   max distance 4.5 cm) and count misses. Only nearby geometry counts, so the
   result captures crevices, not whole-body shadowing.

[build-body-model](../build-body-model.md) runs it after simplification on all
non-fat nodes and stores the result as the `_AO` attribute (normalised byte).
The shader uses it in [bodyMaterials](../../src/features/body-3d/bodyMaterials.md)
(`groove = smoothstep(0.12, 0.8, 1 - _ao)`).

## Depends on

three (`BufferGeometry`, `Ray`, `Vector3`), `three-mesh-bvh`.

## Used by

[build-body-model](../build-body-model.md).

## Tests

none.

## Gotchas / TODO

- The header comment says the app shows "deep separations at low body fat,
  softened at high body fat"; that is stale. Crevice shading is now constant,
  and body fat is shown by the separate fat layer.
- Cost is 16 BVH raycasts per vertex of the simplified model; the build logs
  the time ("ambient occlusion baked in N s").
