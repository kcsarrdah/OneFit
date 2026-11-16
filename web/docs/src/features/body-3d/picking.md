# `src/features/body-3d/picking.ts`

## Purpose

Correct, fast raycasting against the posed (skinned) figure, and surface
points that stay glued to a muscle as it moves.

## Public API

**`class PosedPicker`**

- `constructor(meshes: SkinnedMesh[])`: builds a proxy per mesh and **replaces
  each mesh's `raycast` method**.
- `update()`: re-bakes every proxy to the meshes' current pose and refits its BVH.
- `worldBox(mesh): Box3 | null`: world-space bounds in the current pose.
- `dispose()`: frees proxy geometry and BVHs (does not restore `mesh.raycast`).

**`class SurfaceAnchor`**

- `static fromHit(muscleId, hit: Intersection): SurfaceAnchor | null`.
- `read(point: Vector3, normal: Vector3)`: writes the current world position
  and face normal.
- `readonly muscleId`, `readonly mesh`.

## How it works

three.js raycasts a `SkinnedMesh` against its bind (rest) pose, so after a limb
is posed the hits are wrong. `PosedPicker` keeps, per mesh, a static proxy
`Mesh` sharing the index buffer and holding a copy of the **posed** positions
(`mesh.getVertexPosition(i)`, which applies skinning on the CPU), with a
`three-mesh-bvh` `MeshBVH` and `acceleratedRaycast`. The patched
`mesh.raycast` copies the mesh's `matrixWorld` onto the proxy, raycasts it, and
rewrites each hit's `object` to the real mesh, so R3F events and
`intersectObject` work unchanged. [BodyModel](BodyModel.md) calls `update()`
once the pose has been still for 0.12 s, not every frame.

`SurfaceAnchor` stores a hit as triangle vertex indices plus barycentric
weights (computed in the mesh's local space). `read()` re-evaluates the three
posed vertices each time, so the leader line follows the muscle through pose
changes, height scaling and camera moves.

## Depends on

three, `three-mesh-bvh`.

## Used by

[BodyModel](BodyModel.md) (picker, `fromHit`, `findAnchor`),
[BodyViewer](BodyViewer.md) (`SurfaceAnchor.read` for the leader line and focus).

## Tests

none (needs real skinned meshes).

## Gotchas / TODO

- `getVertexPosition` applies skinning and morph targets only, not the vertex
  shader patches in [bodyMaterials](bodyMaterials.md). Picking and anchors use
  the surface **before** `uInflate` (up to ±8 mm) and the fat layer, so the
  anchor dot can sit slightly inside or outside the drawn muscle.
- During a drag and for 0.12 s after, proxies are stale; hovering a moving limb
  can hit its old position.
- `dispose()` leaves the patched `raycast` in place; it only runs when the
  figure is torn down, so this is harmless today.
