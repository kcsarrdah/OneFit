// Bakes short-range ambient occlusion per vertex: how enclosed each point
// is by nearby surfaces. It's high in the grooves between muscles and low on
// open surfaces, which the app uses to show muscle definition (deep
// separations at low body fat, softened at high body fat).

import { BufferAttribute, BufferGeometry, DoubleSide, Ray, Vector3 } from 'three'
import { MeshBVH } from 'three-mesh-bvh'

const RAYS = 16
/** Only nearby geometry counts: we want crevices, not the whole body. */
const MAX_DISTANCE = 0.045

/**
 * @param {{positions: Float32Array, normals: Float32Array, indices: Uint32Array}[]} meshes
 *   world-space geometry of every mesh in the figure
 * @returns {Float32Array[]} per-mesh, per-vertex openness in 0..1 (1 = fully open)
 */
export function bakeAmbientOcclusion(meshes) {
  // One BVH over the whole figure so neighbouring muscles occlude each other.
  let vertexCount = 0
  let indexCount = 0
  for (const m of meshes) {
    vertexCount += m.positions.length / 3
    indexCount += m.indices.length
  }
  const allPos = new Float32Array(vertexCount * 3)
  const allIdx = new Uint32Array(indexCount)
  let vo = 0
  let io = 0
  for (const m of meshes) {
    allPos.set(m.positions, vo * 3)
    for (let i = 0; i < m.indices.length; i++) allIdx[io + i] = m.indices[i] + vo
    vo += m.positions.length / 3
    io += m.indices.length
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(allPos, 3))
  geometry.setIndex(new BufferAttribute(allIdx, 1))
  const bvh = new MeshBVH(geometry)

  // Fixed cosine-weighted hemisphere directions around +Z (rotated per vertex).
  const dirs = []
  for (let k = 0; k < RAYS; k++) {
    const u = (k + 0.5) / RAYS
    const phi = k * 2.399963 // golden angle
    const r = Math.sqrt(u)
    dirs.push([r * Math.cos(phi), r * Math.sin(phi), Math.sqrt(1 - u)])
  }

  const ray = new Ray()
  const n = new Vector3()
  const t = new Vector3()
  const b = new Vector3()
  return meshes.map(({ positions, normals }) => {
    const out = new Float32Array(positions.length / 3)
    for (let i = 0; i < out.length; i++) {
      n.set(normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2]).normalize()
      // Tangent frame around the normal.
      t.set(Math.abs(n.x) < 0.9 ? 1 : 0, Math.abs(n.x) < 0.9 ? 0 : 1, 0).cross(n).normalize()
      b.copy(n).cross(t)
      let open = 0
      for (const [dx, dy, dz] of dirs) {
        ray.origin.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]).addScaledVector(n, 0.0015)
        ray.direction.set(0, 0, 0).addScaledVector(t, dx).addScaledVector(b, dy).addScaledVector(n, dz).normalize()
        const hit = bvh.raycastFirst(ray, DoubleSide, 0, MAX_DISTANCE)
        if (!hit) open++
      }
      out[i] = open / RAYS
    }
    return out
  })
}
