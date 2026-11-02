// Generates the two major muscles BodyParts3D 4.0 has no mesh for:
// latissimus dorsi and rectus abdominis.
//
// Both are thin sheets lying on the trunk, so they are shaped by
// "shrink-wrapping": we sample the outermost radius of the surrounding
// anatomy (ribs, spine, obliques, serratus, scapula...) around the trunk axis,
// then lay a parametric patch on that surface with an anatomical thickness
// profile. Landmark heights come from the source skeleton (metres, Y up,
// figure facing +Z, body's left on +X).

const DEG = Math.PI / 180

/** Slugs whose surface the generated muscles rest on. */
export const WRAP_SLUGS = [
  /-rib$/,
  /-thoracic-vertebra$/,
  /-lumbar-vertebra$/,
  /^sacrum$/,
  /^hip-bone$/,
  /^external-oblique$/,
  /^serratus-anterior$/,
  /^erector-spinae$/,
  /^scapula$/,
  /^teres-major$/,
]

const AXIS_Z = 0.1
const Y0 = 0.74
const Y1 = 1.42
const DY = 0.005
const DTH = 2 * DEG
const NY = Math.round((Y1 - Y0) / DY) + 1
const NTH = Math.round((2 * Math.PI) / DTH)

/**
 * Builds r(θ, y): the outer radius of the trunk around a vertical axis.
 * θ = 0 faces front (+Z) and increases toward the body's left (+X).
 */
export function buildRadiusField(positionArrays) {
  const field = new Float32Array(NY * NTH).fill(-1)
  for (const a of positionArrays) {
    for (let i = 0; i < a.length; i += 3) {
      const x = a[i]
      const y = a[i + 1]
      const z = a[i + 2] - AXIS_Z
      if (y < Y0 || y > Y1) continue
      const r = Math.hypot(x, z)
      const iy = Math.round((y - Y0) / DY)
      const it = ((Math.round(Math.atan2(x, z) / DTH) % NTH) + NTH) % NTH
      const k = iy * NTH + it
      if (r > field[k]) field[k] = r
    }
  }

  // Fill gaps (e.g. the front of the abdomen, where nothing is modelled)
  // by interpolating around each row, then smooth out bony detail.
  // Dilate first so smoothing can't pull the surface below bony peaks.
  for (let iy = 0; iy < NY; iy++) fillRow(field, iy)
  for (let pass = 0; pass < 3; pass++) dilate(field)
  for (let pass = 0; pass < 4; pass++) blur(field)

  return (theta, y) => {
    const fy = Math.min(NY - 1, Math.max(0, (y - Y0) / DY))
    const ft = (((theta / DTH) % NTH) + NTH) % NTH
    const y0 = Math.floor(fy)
    const t0 = Math.floor(ft)
    const y1 = Math.min(NY - 1, y0 + 1)
    const t1 = (t0 + 1) % NTH
    const wy = fy - y0
    const wt = ft - t0
    const at = (yy, tt) => field[yy * NTH + tt]
    return (
      (at(y0, t0) * (1 - wt) + at(y0, t1) * wt) * (1 - wy) + (at(y1, t0) * (1 - wt) + at(y1, t1) * wt) * wy
    )
  }
}

function fillRow(field, iy) {
  const row = iy * NTH
  const filled = []
  for (let t = 0; t < NTH; t++) if (field[row + t] > 0) filled.push(t)
  if (filled.length === 0) return
  for (let n = 0; n < filled.length; n++) {
    const a = filled[n]
    const b = filled[(n + 1) % filled.length]
    const gap = (b - a + NTH) % NTH || NTH
    for (let s = 1; s < gap; s++) {
      const w = s / gap
      field[row + ((a + s) % NTH)] = field[row + a] * (1 - w) + field[row + b] * w
    }
  }
}

function dilate(field) {
  const copy = field.slice()
  for (let iy = 0; iy < NY; iy++)
    for (let t = 0; t < NTH; t++) {
      let m = copy[iy * NTH + t]
      for (let dy = -1; dy <= 1; dy++) {
        const yy = iy + dy
        if (yy < 0 || yy >= NY) continue
        for (let dt = -1; dt <= 1; dt++) m = Math.max(m, copy[yy * NTH + ((t + dt + NTH) % NTH)])
      }
      field[iy * NTH + t] = m
    }
}

function blur(field) {
  const copy = field.slice()
  for (let iy = 0; iy < NY; iy++) {
    for (let t = 0; t < NTH; t++) {
      let sum = 0
      let n = 0
      for (let dy = -1; dy <= 1; dy++) {
        const yy = iy + dy
        if (yy < 0 || yy >= NY) continue
        for (let dt = -1; dt <= 1; dt++) {
          const v = copy[yy * NTH + ((t + dt + NTH) % NTH)]
          if (v > 0) {
            sum += v
            n++
          }
        }
      }
      if (n) field[iy * NTH + t] = sum / n
    }
  }
}

const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}
const lerp = (a, b, t) => a + (b - a) * t

/** Point on the wrapped surface at (θ, y), pushed out by `offset` metres. */
function onSurface(radius, theta, y, offset) {
  const r = radius(theta, y) + offset
  return [Math.sin(theta) * r, y, AXIS_Z + Math.cos(theta) * r]
}

/**
 * Latissimus dorsi for one side (sign +1 = body's left, -1 = right).
 * u runs medial (spine) → lateral (armpit), v runs bottom → top.
 */
export function latissimusDorsi(radius, sign, humerusInsertion) {
  const NU = 56
  const NV = 60
  return gridMesh(NU, NV, (u, v) => {
    // φ: angle from the back midline toward the side.
    // Starts just lateral to the spine, leaving the erectors visible through
    // the thoracolumbar fascia as anatomical atlases show it.
    const phiMedial = lerp(14 * DEG, 9 * DEG, v)
    const phiLateral = lerp(98 * DEG, 104 * DEG, v)
    const phi = lerp(phiMedial, phiLateral, Math.pow(u, 0.9))

    // Lower border follows the iliac crest; upper border rises from T7 to
    // the armpit over the inferior angle of the scapula.
    const yBottom = lerp(0.955, 0.985, u) - Math.sin(u * Math.PI) * 0.012
    const yTop = lerp(1.2, 1.262, Math.pow(u, 0.7)) + Math.sin(u * Math.PI) * 0.01
    const y = lerp(yBottom, yTop, v)

    // Thick fleshy belly laterally, thin aponeurosis near the spine.
    const belly = smooth(0.15, 0.55, u) * Math.pow(Math.sin(Math.PI * v), 0.55)
    const taper = Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15)), 0.35)
    // Fibres run from low and medial up toward the armpit; ridge them.
    const fibres = 1 + 0.12 * Math.sin((u * 0.55 - v * 0.85) * 70) * smooth(0.1, 0.4, u)
    const thickness = 0.002 + 0.009 * belly * taper * fibres

    const theta = sign * (Math.PI - phi)
    const p = onSurface(radius, theta, y, thickness)

    // Toward the top-lateral corner the muscle leaves the ribcage and
    // converges into its tendon on the humerus (posterior axillary fold).
    const w = smooth(0.62, 1, u) * smooth(0.55, 1, v)
    const h = [sign * humerusInsertion[0], humerusInsertion[1], humerusInsertion[2]]
    return [lerp(p[0], h[0], w * 0.85), lerp(p[1], h[1], w * 0.85), lerp(p[2], h[2], w * 0.85)]
  })
}

/**
 * Rectus abdominis for one side, with tendinous intersections (the
 * "six-pack" grooves) and the linea alba gap at the midline.
 */
export function rectusAbdominis(radius, sign) {
  const NU = 18
  const NV = 56
  const yBottom = 0.875
  const yTop = 1.175
  return gridMesh(NU, NV, (u, v) => {
    const y = lerp(yBottom, yTop, v)
    const xMedial = 0.006
    const xLateral = lerp(0.032, 0.078, Math.pow(v, 0.7))
    const x = lerp(xMedial, xLateral, u)

    const r0 = radius(0, y)
    const theta = sign * Math.asin(Math.min(0.95, x / r0))

    const grooves = [0.5, 0.7, 0.87].reduce((acc, g) => acc * (1 - 0.45 * Math.exp(-(((v - g) / 0.018) ** 2))), 1)
    const edge = Math.pow(Math.sin(Math.PI * u), 0.45) * Math.pow(Math.sin(Math.PI * Math.min(1, v * 1.05)), 0.3)
    const belly = 0.004 + 0.005 * Math.sin(Math.PI * v)
    const fibres = 1 + 0.06 * Math.sin(u * Math.PI * 7)
    const thickness = 0.002 + (0.007 + belly) * edge * grooves * fibres
    return onSurface(radius, theta, y, thickness)
  })
}

/** Triangulates a (NU+1) × (NV+1) parametric grid, with outward normals. */
function gridMesh(NU, NV, fn) {
  const positions = new Float32Array((NU + 1) * (NV + 1) * 3)
  for (let j = 0; j <= NV; j++)
    for (let i = 0; i <= NU; i++) positions.set(fn(i / NU, j / NV), (j * (NU + 1) + i) * 3)

  const indices = []
  for (let j = 0; j < NV; j++)
    for (let i = 0; i < NU; i++) {
      const a = j * (NU + 1) + i
      const b = a + 1
      const c = a + NU + 1
      const d = c + 1
      indices.push(a, b, d, a, d, c)
    }

  let normals = vertexNormals(positions, indices)
  // Make sure the sheet faces away from the trunk axis.
  const mid = ((NV / 2) | 0) * (NU + 1) + ((NU / 2) | 0)
  const out = [positions[mid * 3], 0, positions[mid * 3 + 2] - AXIS_Z]
  if (normals[mid * 3] * out[0] + normals[mid * 3 + 2] * out[2] < 0) {
    for (let t = 0; t < indices.length; t += 3) [indices[t + 1], indices[t + 2]] = [indices[t + 2], indices[t + 1]]
    normals = normals.map((n) => -n)
  }
  return { positions, normals, indices: new Uint32Array(indices) }
}

function vertexNormals(p, idx) {
  const n = new Float32Array(p.length)
  for (let t = 0; t < idx.length; t += 3) {
    const [a, b, c] = [idx[t] * 3, idx[t + 1] * 3, idx[t + 2] * 3]
    const e1 = [p[b] - p[a], p[b + 1] - p[a + 1], p[b + 2] - p[a + 2]]
    const e2 = [p[c] - p[a], p[c + 1] - p[a + 1], p[c + 2] - p[a + 2]]
    const cx = e1[1] * e2[2] - e1[2] * e2[1]
    const cy = e1[2] * e2[0] - e1[0] * e2[2]
    const cz = e1[0] * e2[1] - e1[1] * e2[0]
    for (const v of [a, b, c]) {
      n[v] += cx
      n[v + 1] += cy
      n[v + 2] += cz
    }
  }
  for (let i = 0; i < n.length; i += 3) {
    const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1
    n[i] /= l
    n[i + 1] /= l
    n[i + 2] /= l
  }
  return n
}
