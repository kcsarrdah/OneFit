// Builds the subcutaneous fat layer: a smooth envelope around the muscles
// and bones, separate from them, which the app thickens with body fat.
//
// Each body part (trunk with neck and head, each arm, each leg) is voxelized,
// morphologically closed so the envelope bridges the grooves between muscles
// (fat fills those first), and meshed with surface nets. Parts are meshed
// separately so arms don't fuse to the torso, nor the thighs to each other;
// they overlap at the shoulders and hips.
//
// Every vertex also gets a distribution weight: how much of the fat ends up
// there relative to the body's average, following the typical male pattern
// (abdomen and flanks first, then lower back, chest and thighs; little on
// the forearms, hands, feet and head). Abdominal ultrasound sites make up
// about half of men's subcutaneous fat; legs and arms much less.
//
// Coordinates are metres, Y up, figure facing +Z, body's left on +X.

/** Voxel size. */
const H = 0.005
/** Closing radius: grooves up to about twice this wide are bridged. */
const R = 0.012
/**
 * The solid includes the thickened surface shell (about a voxel proud of
 * the real surface); pull the envelope back in by about that much so it
 * starts snug on the muscles.
 */
const SHELL = 0.002

const gauss = (x, c, s) => Math.exp(-0.5 * ((x - c) / s) ** 2)
const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

/**
 * @param {{positions: ArrayLike<number>, indices: ArrayLike<number>}[]} meshes
 *   the part's source geometry
 * @returns {{positions: Float32Array, normals: Float32Array, indices: Uint32Array}}
 */
export function envelope(meshes) {
  const lo = [Infinity, Infinity, Infinity]
  const hi = [-Infinity, -Infinity, -Infinity]
  for (const { positions } of meshes)
    for (let i = 0; i < positions.length; i += 3)
      for (let k = 0; k < 3; k++) {
        lo[k] = Math.min(lo[k], positions[i + k])
        hi[k] = Math.max(hi[k], positions[i + k])
      }
  const pad = R + 4 * H
  const origin = lo.map((v) => v - pad)
  const dims = hi.map((v, k) => Math.ceil((v + pad - origin[k]) / H) + 1)
  const [NX, NY, NZ] = dims
  const N = NX * NY * NZ
  const at = (x, y, z) => (z * NY + y) * NX + x

  // 1. Splat every triangle's surface into the grid.
  const surface = new Uint8Array(N)
  const mark = (x, y, z) => {
    const i = Math.round((x - origin[0]) / H)
    const j = Math.round((y - origin[1]) / H)
    const k = Math.round((z - origin[2]) / H)
    surface[at(i, j, k)] = 1
  }
  for (const { positions: p, indices } of meshes) {
    for (let t = 0; t < indices.length; t += 3) {
      const a = indices[t] * 3
      const b = indices[t + 1] * 3
      const c = indices[t + 2] * 3
      const edge = Math.max(
        Math.hypot(p[a] - p[b], p[a + 1] - p[b + 1], p[a + 2] - p[b + 2]),
        Math.hypot(p[b] - p[c], p[b + 1] - p[c + 1], p[b + 2] - p[c + 2]),
        Math.hypot(p[c] - p[a], p[c + 1] - p[a + 1], p[c + 2] - p[a + 2]),
      )
      const n = Math.max(1, Math.ceil(edge / (H * 0.5)))
      for (let u = 0; u <= n; u++)
        for (let v = 0; v <= n - u; v++) {
          const wu = u / n
          const wv = v / n
          const ww = 1 - wu - wv
          mark(
            p[a] * ww + p[b] * wu + p[c] * wv,
            p[a + 1] * ww + p[b + 1] * wu + p[c + 1] * wv,
            p[a + 2] * ww + p[b + 2] * wu + p[c + 2] * wv,
          )
        }
    }
  }

  // 2. Solid = everything the outside can't reach. The shell is thickened
  // by a voxel first so the 6-connected flood can't slip through diagonals.
  const shell = dilate(surface, dims)
  const outside = new Uint8Array(N)
  const stack = [at(0, 0, 0)]
  outside[stack[0]] = 1
  while (stack.length) {
    const v = stack.pop()
    const x = v % NX
    const y = Math.floor(v / NX) % NY
    const z = Math.floor(v / (NX * NY))
    const visit = (nx, ny, nz) => {
      if (nx < 0 || ny < 0 || nz < 0 || nx >= NX || ny >= NY || nz >= NZ) return
      const w = at(nx, ny, nz)
      if (outside[w] || shell[w]) return
      outside[w] = 1
      stack.push(w)
    }
    visit(x - 1, y, z)
    visit(x + 1, y, z)
    visit(x, y - 1, z)
    visit(x, y + 1, z)
    visit(x, y, z - 1)
    visit(x, y, z + 1)
  }

  // 3. Closing: dilate by R, then measure how deep inside the dilated set
  // each voxel is. The envelope is where that depth reaches R.
  const toSolid = distanceTransform(outside, dims, (v) => v === 0)
  const dilated = new Uint8Array(N)
  for (let i = 0; i < N; i++) dilated[i] = toSolid[i] <= R / H ? 1 : 0
  const depth = distanceTransform(dilated, dims, (v) => v === 0)
  const phi = new Float32Array(N)
  for (let i = 0; i < N; i++) phi[i] = depth[i] * H - R - SHELL // > 0 inside
  blur(phi, dims)
  blur(phi, dims)

  const mesh = surfaceNets(phi, dims, origin)
  const kept = largestComponent(mesh)
  taubin(kept, 12)
  kept.normals = vertexNormals(kept.positions, kept.indices)
  return kept
}

/** 3×3×3 binary dilation. */
function dilate(src, [NX, NY, NZ]) {
  const out = new Uint8Array(src.length)
  for (let z = 0; z < NZ; z++)
    for (let y = 0; y < NY; y++)
      for (let x = 0; x < NX; x++) {
        if (!src[(z * NY + y) * NX + x]) continue
        for (let dz = -1; dz <= 1; dz++)
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              const a = x + dx
              const b = y + dy
              const c = z + dz
              if (a >= 0 && b >= 0 && c >= 0 && a < NX && b < NY && c < NZ) out[(c * NY + b) * NX + a] = 1
            }
      }
  return out
}

/**
 * Exact Euclidean distance (in voxels) from each voxel to the nearest voxel
 * where `isFeature(grid[i])`, by Felzenszwalb & Huttenlocher's separable
 * squared-distance transform.
 */
function distanceTransform(grid, [NX, NY, NZ], isFeature) {
  const INF = 1e20
  const d = new Float64Array(grid.length)
  for (let i = 0; i < grid.length; i++) d[i] = isFeature(grid[i]) ? 0 : INF
  const n = Math.max(NX, NY, NZ)
  const f = new Float64Array(n)
  const out = new Float64Array(n)
  const vtx = new Int32Array(n)
  const zb = new Float64Array(n + 1)
  const pass = (len, index) => {
    for (let q = 0; q < len; q++) f[q] = d[index(q)]
    let k = 0
    vtx[0] = 0
    zb[0] = -INF
    zb[1] = INF
    for (let q = 1; q < len; q++) {
      let s
      do {
        const p = vtx[k]
        s = (f[q] + q * q - (f[p] + p * p)) / (2 * q - 2 * p)
        if (s <= zb[k]) k--
        else break
      } while (k >= 0)
      k++
      vtx[k] = q
      zb[k] = s
      zb[k + 1] = INF
    }
    k = 0
    for (let q = 0; q < len; q++) {
      while (zb[k + 1] < q) k++
      const p = vtx[k]
      out[q] = (q - p) * (q - p) + f[p]
    }
    for (let q = 0; q < len; q++) d[index(q)] = out[q]
  }
  for (let z = 0; z < NZ; z++) for (let y = 0; y < NY; y++) pass(NX, (q) => (z * NY + y) * NX + q)
  for (let z = 0; z < NZ; z++) for (let x = 0; x < NX; x++) pass(NY, (q) => (z * NY + q) * NX + x)
  for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) pass(NZ, (q) => (q * NY + y) * NX + x)
  const r = new Float32Array(grid.length)
  for (let i = 0; i < grid.length; i++) r[i] = Math.sqrt(d[i])
  return r
}

/** Separable 1-2-1 blur, in place. */
function blur(a, [NX, NY, NZ]) {
  const tmp = new Float32Array(a.length)
  const strides = [1, NX, NX * NY]
  const sizes = [NX, NY, NZ]
  for (let axis = 0; axis < 3; axis++) {
    const s = strides[axis]
    tmp.set(a)
    for (let i = 0; i < a.length; i++) {
      const c = Math.floor(i / s) % sizes[axis]
      if (c === 0 || c === sizes[axis] - 1) continue
      a[i] = 0.25 * tmp[i - s] + 0.5 * tmp[i] + 0.25 * tmp[i + s]
    }
  }
}

/** Naive surface nets on the zero level set of phi (positive inside). */
function surfaceNets(phi, [NX, NY, NZ], origin) {
  const at = (x, y, z) => (z * NY + y) * NX + x
  const cellVertex = new Int32Array((NX - 1) * (NY - 1) * (NZ - 1)).fill(-1)
  const cell = (x, y, z) => (z * (NY - 1) + y) * (NX - 1) + x
  const positions = []
  const corners = [
    [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
    [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1],
  ]
  const edges = [
    [0, 1], [2, 3], [4, 5], [6, 7],
    [0, 2], [1, 3], [4, 6], [5, 7],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ]
  const v = new Float32Array(8)
  for (let z = 0; z < NZ - 1; z++)
    for (let y = 0; y < NY - 1; y++)
      for (let x = 0; x < NX - 1; x++) {
        let inside = 0
        for (let c = 0; c < 8; c++) {
          v[c] = phi[at(x + corners[c][0], y + corners[c][1], z + corners[c][2])]
          if (v[c] > 0) inside++
        }
        if (inside === 0 || inside === 8) continue
        let sx = 0
        let sy = 0
        let sz = 0
        let n = 0
        for (const [a, b] of edges) {
          if (v[a] > 0 === v[b] > 0) continue
          const t = v[a] / (v[a] - v[b])
          sx += corners[a][0] + (corners[b][0] - corners[a][0]) * t
          sy += corners[a][1] + (corners[b][1] - corners[a][1]) * t
          sz += corners[a][2] + (corners[b][2] - corners[a][2]) * t
          n++
        }
        cellVertex[cell(x, y, z)] = positions.length / 3
        positions.push(origin[0] + (x + sx / n) * H, origin[1] + (y + sy / n) * H, origin[2] + (z + sz / n) * H)
      }

  // One quad per grid edge that crosses the surface, wound so the normal
  // points from inside (phi > 0) to outside.
  const indices = []
  const quad = (a, b, c, d, flip) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return
    if (flip) indices.push(a, d, c, a, c, b)
    else indices.push(a, b, c, a, c, d)
  }
  for (let z = 1; z < NZ - 1; z++)
    for (let y = 1; y < NY - 1; y++)
      for (let x = 1; x < NX - 1; x++) {
        const p0 = phi[at(x, y, z)] > 0
        if (x < NX - 1 && p0 !== phi[at(x + 1, y, z)] > 0)
          quad(cellVertex[cell(x, y - 1, z - 1)], cellVertex[cell(x, y, z - 1)], cellVertex[cell(x, y, z)], cellVertex[cell(x, y - 1, z)], !p0)
        if (y < NY - 1 && p0 !== phi[at(x, y + 1, z)] > 0)
          quad(cellVertex[cell(x - 1, y, z - 1)], cellVertex[cell(x - 1, y, z)], cellVertex[cell(x, y, z)], cellVertex[cell(x, y, z - 1)], !p0)
        if (z < NZ - 1 && p0 !== phi[at(x, y, z + 1)] > 0)
          quad(cellVertex[cell(x - 1, y - 1, z)], cellVertex[cell(x, y - 1, z)], cellVertex[cell(x, y, z)], cellVertex[cell(x - 1, y, z)], !p0)
      }
  return { positions: Float32Array.from(positions), indices: Uint32Array.from(indices) }
}

/** Keeps the largest connected piece (drops cavities inside the body). */
function largestComponent({ positions, indices }) {
  const n = positions.length / 3
  const parent = Int32Array.from({ length: n }, (_, i) => i)
  const find = (i) => {
    while (parent[i] !== i) i = parent[i] = parent[parent[i]]
    return i
  }
  for (let t = 0; t < indices.length; t += 3) {
    const a = find(indices[t])
    parent[find(indices[t + 1])] = a
    parent[find(indices[t + 2])] = a
  }
  const count = new Map()
  for (let t = 0; t < indices.length; t += 3) {
    const r = find(indices[t])
    count.set(r, (count.get(r) ?? 0) + 1)
  }
  const best = [...count].sort((a, b) => b[1] - a[1])[0][0]
  const remap = new Int32Array(n).fill(-1)
  const pos = []
  const idx = []
  for (let t = 0; t < indices.length; t += 3) {
    if (find(indices[t]) !== best) continue
    for (let k = 0; k < 3; k++) {
      const i = indices[t + k]
      if (remap[i] < 0) {
        remap[i] = pos.length / 3
        pos.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
      }
      idx.push(remap[i])
    }
  }
  return { positions: Float32Array.from(pos), indices: Uint32Array.from(idx) }
}

/** Taubin smoothing: removes voxel stair-steps without shrinking. */
function taubin(mesh, iterations) {
  const { positions, indices } = mesh
  const n = positions.length / 3
  const neighbours = Array.from({ length: n }, () => new Set())
  for (let t = 0; t < indices.length; t += 3)
    for (let k = 0; k < 3; k++) {
      const a = indices[t + k]
      const b = indices[t + ((k + 1) % 3)]
      neighbours[a].add(b)
      neighbours[b].add(a)
    }
  const tmp = new Float32Array(positions.length)
  const step = (lambda) => {
    for (let i = 0; i < n; i++) {
      let x = 0
      let y = 0
      let z = 0
      for (const j of neighbours[i]) {
        x += positions[j * 3]
        y += positions[j * 3 + 1]
        z += positions[j * 3 + 2]
      }
      const m = neighbours[i].size || 1
      for (const [k, s] of [[0, x], [1, y], [2, z]]) tmp[i * 3 + k] = positions[i * 3 + k] + lambda * (s / m - positions[i * 3 + k])
    }
    positions.set(tmp)
  }
  for (let it = 0; it < iterations; it++) {
    step(0.5)
    step(-0.53)
  }
}

export function vertexNormals(positions, indices) {
  const normals = new Float32Array(positions.length)
  for (let t = 0; t < indices.length; t += 3) {
    const [a, b, c] = [indices[t] * 3, indices[t + 1] * 3, indices[t + 2] * 3]
    const ux = positions[b] - positions[a]
    const uy = positions[b + 1] - positions[a + 1]
    const uz = positions[b + 2] - positions[a + 2]
    const vx = positions[c] - positions[a]
    const vy = positions[c + 1] - positions[a + 1]
    const vz = positions[c + 2] - positions[a + 2]
    const nx = uy * vz - uz * vy
    const ny = uz * vx - ux * vz
    const nz = ux * vy - uy * vx
    for (const i of [a, b, c]) {
      normals[i] += nx
      normals[i + 1] += ny
      normals[i + 2] += nz
    }
  }
  for (let i = 0; i < normals.length; i += 3) {
    const l = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1
    normals[i] /= l
    normals[i + 1] /= l
    normals[i + 2] /= l
  }
  return normals
}

/** Signed volume of a closed mesh (positive when normals point outward). */
export function signedVolume(positions, indices) {
  let v = 0
  for (let t = 0; t < indices.length; t += 3) {
    const [a, b, c] = [indices[t] * 3, indices[t + 1] * 3, indices[t + 2] * 3]
    v +=
      (positions[a] * (positions[b + 1] * positions[c + 2] - positions[b + 2] * positions[c + 1]) -
        positions[a + 1] * (positions[b] * positions[c + 2] - positions[b + 2] * positions[c]) +
        positions[a + 2] * (positions[b] * positions[c + 1] - positions[b + 1] * positions[c])) /
      6
  }
  return v
}

/**
 * Landmarks for the distribution, from the rig joints (lib/rig.mjs) and the
 * bottom of the head.
 */
export function fatLandmarks(joints, headBottomY) {
  const avg = (a, b) => a.map((v, k) => (v + b[k]) / 2)
  return {
    hipY: avg(joints['hip-l'], joints['hip-r'])[1],
    shoulderY: avg(joints['shoulder-l'], joints['shoulder-r'])[1],
    headBottomY,
    joints,
  }
}

/** Parts the fat layer is built from. */
export const FAT_PARTS = ['trunk', 'arm-l', 'arm-r', 'leg-l', 'leg-r']

/**
 * Relative fat thickness at a point of a part's envelope (1 ≈ the body's
 * average), plus how much visceral (belly) bulge it takes.
 *
 * @param {string} part one of FAT_PARTS
 * @param {number[]} p position
 * @param {number[]} n outward normal
 */
export function fatWeight(part, p, n, { hipY, shoulderY, headBottomY, joints }) {
  const [x, y] = p
  const ax = Math.abs(x)
  const front = smooth(-0.1, 0.5, n[2])
  const back = smooth(-0.1, 0.5, -n[2])

  if (part === 'trunk') {
    let w =
      0.55 +
      // Lower belly, the first place men store fat and the last to lose it.
      2.8 * gauss(y, hipY + 0.09, 0.08) * gauss(ax, 0, 0.12) * front +
      // Flanks ("love handles") and lower back.
      2.2 * gauss(y, hipY + 0.13, 0.06) * gauss(ax, 0.15, 0.05) +
      1.5 * gauss(y, hipY + 0.12, 0.08) * gauss(ax, 0, 0.12) * back +
      // Chest and upper back.
      1.1 * gauss(y, shoulderY - 0.15, 0.07) * gauss(ax, 0.09, 0.06) * front +
      0.8 * gauss(y, shoulderY - 0.12, 0.09) * back +
      // Buttocks.
      1.2 * gauss(y, hipY - 0.06, 0.07) * back +
      // Under the chin and the back of the neck.
      1.1 * gauss(y, headBottomY + 0.01, 0.03) * front +
      0.5 * gauss(y, shoulderY + 0.07, 0.04) * back
    // Very little over the skull and face.
    w *= 1 - 0.85 * smooth(headBottomY + 0.02, headBottomY + 0.07, y)
    const visceral = gauss(y, hipY + 0.11, 0.08) * gauss(ax, 0, 0.1) * front
    return { w, visceral }
  }

  const s = part.endsWith('-l') ? 'l' : 'r'
  const medial = smooth(0.1, 0.6, -n[0] * (s === 'l' ? 1 : -1))
  const lateral = smooth(0.1, 0.6, n[0] * (s === 'l' ? 1 : -1))
  if (part.startsWith('arm')) {
    const E = joints[`elbow-${s}`]
    const W = joints[`wrist-${s}`]
    const upper = smooth(E[1] - 0.03, E[1] + 0.03, y)
    const hand = smooth(W[1], W[1] - 0.03, y)
    // Back of the upper arm holds the most; forearms and hands little.
    const w = (0.55 + 0.55 * back) * upper + 0.3 * (1 - upper) * (1 - hand) + 0.12 * hand
    return { w, visceral: 0 }
  }
  const H = joints[`hip-${s}`]
  const K = joints[`knee-${s}`]
  const A = joints[`ankle-${s}`]
  const thigh = smooth(K[1] - 0.03, K[1] + 0.05, y)
  const foot = smooth(A[1] + 0.01, A[1] - 0.03, y)
  const w =
    (0.95 + 0.5 * medial + 0.6 * gauss(y, H[1] - 0.08, 0.06) * lateral) * thigh +
    0.3 * medial * gauss(y, K[1], 0.04) +
    (0.45 + 0.15 * back) * (1 - thigh) * (1 - foot) +
    0.12 * foot
  return { w, visceral: 0 }
}
