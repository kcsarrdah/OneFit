// A light skeleton rig for posing the figure: spine, shoulders, elbows,
// wrists, hips, knees and ankles. Joint positions come from the source
// skeleton; every vertex gets smooth skin weights so muscles bend around
// joints instead of tearing apart.
//
// Coordinates are metres, Y up, figure facing +Z, body's left on +X.

/** Joint order = glTF skin joint order. The app looks joints up by name. */
export const JOINTS = [
  { name: 'root', parent: null },
  { name: 'spine', parent: 'root' },
  { name: 'shoulder-l', parent: 'spine' },
  { name: 'elbow-l', parent: 'shoulder-l' },
  { name: 'wrist-l', parent: 'elbow-l' },
  { name: 'shoulder-r', parent: 'spine' },
  { name: 'elbow-r', parent: 'shoulder-r' },
  { name: 'wrist-r', parent: 'elbow-r' },
  { name: 'hip-l', parent: 'root' },
  { name: 'knee-l', parent: 'hip-l' },
  { name: 'ankle-l', parent: 'knee-l' },
  { name: 'hip-r', parent: 'root' },
  { name: 'knee-r', parent: 'hip-r' },
  { name: 'ankle-r', parent: 'knee-r' },
]
const J = Object.fromEntries(JOINTS.map((j, i) => [j.name, i]))

/** How a muscle group's vertices relate to the limbs. */
export function muscleHint(muscleId) {
  if (['biceps', 'triceps', 'forearms'].includes(muscleId)) return 'arm'
  if (muscleId === 'delts') return 'shoulder'
  if (['quads', 'hamstrings', 'calves', 'shins', 'adductors'].includes(muscleId)) return 'leg'
  if (muscleId === 'glutes') return 'hip'
  return 'torso'
}

/** Hints for muscles that are rendered as non-selectable context. */
const CONTEXT_HINTS = {
  iliacus: 'hip',
  'psoas-major': 'hip',
  popliteus: 'leg',
  'tibialis-posterior': 'leg',
  'flexor-digitorum-longus': 'leg',
  'flexor-digitorum-brevis': 'leg',
}
export const contextHint = (slug) => CONTEXT_HINTS[slug] ?? 'torso'

const HAND = /(capitate|hamate|lunate|pisiform|scaphoid|trapezium|trapezoid|triquetral|metacarpal|finger|thumb)/
const FOOT = /(talus|calcaneus|navicular|cuboid|cuneiform|metatarsal|toe|sesamoid)/

/**
 * Bones move rigidly with a single joint. Returns the joint name for a bone
 * slug on a given side ('l' | 'r').
 */
export function boneJoint(slug, side) {
  if (slug === 'humerus') return `shoulder-${side}`
  if (slug === 'radius' || slug === 'ulna') return `elbow-${side}`
  if (HAND.test(slug)) return `wrist-${side}`
  if (slug === 'femur') return `hip-${side}`
  if (['patella', 'tibia', 'fibula'].includes(slug)) return `knee-${side}`
  if (FOOT.test(slug)) return `ankle-${side}`
  if (/lumbar|sacrum|hip-bone|pelvis/.test(slug)) return 'root'
  // Ribs, thoracic and cervical spine, skull, scapula and clavicle.
  return 'spine'
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const len = (a) => Math.hypot(a[0], a[1], a[2])
const norm = (a) => {
  const l = len(a) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}
const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

function centroid(points) {
  const c = [0, 0, 0]
  for (const p of points) for (let k = 0; k < 3; k++) c[k] += p[k] / points.length
  return c
}

/** Vertices of the given slugs on one side (sign +1 = left / +X). */
function sideVerts(bySlug, slugs, sign) {
  const out = []
  for (const slug of slugs)
    for (const prim of bySlug.get(slug) ?? []) {
      const a = prim.getAttribute('POSITION').getArray()
      for (let i = 0; i < a.length; i += 3) if (Math.sign(a[i]) === sign) out.push([a[i], a[i + 1], a[i + 2]])
    }
  if (!out.length) throw new Error(`no vertices for ${slugs.join(', ')}`)
  return out
}

const band = (pts, pick) => {
  const ys = pts.map((p) => p[1])
  return pick(pts, Math.min(...ys), Math.max(...ys))
}

/** World positions of every joint, from bone landmarks. */
export function computeJoints(bySlug) {
  const pos = { root: [0, 0, 0] }
  pos.spine = centroid(sideVerts(bySlug, ['first-lumbar-vertebra'], 1).concat(sideVerts(bySlug, ['first-lumbar-vertebra'], -1)))

  for (const [sign, s] of [[1, 'l'], [-1, 'r']]) {
    const humerus = sideVerts(bySlug, ['humerus'], sign)
    // Humeral head: the top of the bone, minus the outer greater tubercle.
    pos[`shoulder-${s}`] = band(humerus, (p, lo, hi) => {
      const top = p.filter((v) => v[1] > hi - 0.04)
      const mid = centroid(top)
      return centroid(top.filter((v) => Math.abs(v[0]) <= Math.abs(mid[0]) + 0.005))
    })
    pos[`elbow-${s}`] = band(humerus, (p, lo) => centroid(p.filter((v) => v[1] < lo + 0.025)))
    const forearm = sideVerts(bySlug, ['radius', 'ulna'], sign)
    pos[`wrist-${s}`] = band(forearm, (p, lo) => centroid(p.filter((v) => v[1] < lo + 0.02)))

    const femur = sideVerts(bySlug, ['femur'], sign)
    // Femoral head: the medial half of the top of the femur.
    pos[`hip-${s}`] = band(femur, (p, lo, hi) => {
      const top = p.filter((v) => v[1] > hi - 0.05)
      const mx = centroid(top)[0]
      return centroid(top.filter((v) => Math.abs(v[0]) < Math.abs(mx)))
    })
    pos[`knee-${s}`] = band(femur, (p, lo) => {
      const c = centroid(p.filter((v) => v[1] < lo + 0.03))
      return [c[0], c[1] - 0.01, c[2]]
    })
    const tibia = sideVerts(bySlug, ['tibia'], sign)
    pos[`ankle-${s}`] = band(tibia, (p, lo) => centroid(p.filter((v) => v[1] < lo + 0.02)))
  }
  return pos
}

/** Signed distance of p past joint `at` along the bone direction `dir`. */
const along = (p, at, dir) => dot(sub(p, at), dir)

function distToSegment(p, a, b) {
  const ab = sub(b, a)
  const t = Math.min(1, Math.max(0, dot(sub(p, a), ab) / dot(ab, ab)))
  return len(sub(p, [a[0] + ab[0] * t, a[1] + ab[1] * t, a[2] + ab[2] * t]))
}

/**
 * Skin weights for one vertex as a {jointIndex: weight} map.
 * `hint` comes from skinHint(): limb muscles follow their limb fully,
 * shoulder/hip muscles blend across the joint, and "auto" (bones, context
 * muscles) is classified by distance to the limb bones.
 */
export function vertexWeights(p, hint, joints) {
  const s = p[0] >= 0 ? 'l' : 'r'
  const S = joints[`shoulder-${s}`]
  const E = joints[`elbow-${s}`]
  const W = joints[`wrist-${s}`]
  const H = joints[`hip-${s}`]
  const K = joints[`knee-${s}`]
  const A = joints[`ankle-${s}`]
  const upper = norm(sub(E, S))
  const fore = norm(sub(W, E))
  const thigh = norm(sub(K, H))
  const shin = norm(sub(A, K))

  // Membership in the arm / leg chain, 0..1.
  let arm = 0
  let leg = 0
  const pastShoulder = along(p, S, upper)
  const pastHip = along(p, H, thigh)
  if (hint === 'arm') arm = 1
  else if (hint === 'shoulder') arm = smooth(-0.04, 0.06, pastShoulder)
  else if (hint === 'leg') leg = smooth(-0.04, 0.05, pastHip)
  else if (hint === 'hip') leg = 0.4 * smooth(-0.02, 0.08, pastHip)
  else if (hint === 'auto') {
    const handEnd = [W[0] + fore[0] * 0.24, W[1] + fore[1] * 0.24, W[2] + fore[2] * 0.24]
    const dArm = Math.min(distToSegment(p, S, E), distToSegment(p, E, W), distToSegment(p, W, handEnd))
    const lateral = Math.abs(p[0]) - (Math.abs(S[0]) - 0.03)
    if (dArm < 0.06 && lateral > 0) arm = smooth(-0.03, 0.04, pastShoulder)
    const footEnd = [A[0], A[1] - 0.08, A[2] + 0.2]
    const dLeg = Math.min(distToSegment(p, H, K), distToSegment(p, K, A), distToSegment(p, A, footEnd))
    if (dLeg < 0.06 && p[1] < H[1] - 0.02) leg = smooth(0, 0.06, pastHip)
  }

  const w = {}
  const add = (j, v) => {
    if (v > 1e-4) w[J[j]] = (w[J[j]] ?? 0) + v
  }

  if (arm > 0) {
    const atElbow = smooth(-0.025, 0.025, along(p, E, upper))
    const atWrist = smooth(-0.02, 0.02, along(p, W, fore))
    add(`shoulder-${s}`, arm * (1 - atElbow))
    add(`elbow-${s}`, arm * atElbow * (1 - atWrist))
    add(`wrist-${s}`, arm * atElbow * atWrist)
  }
  if (leg > 0) {
    const atKnee = smooth(-0.03, 0.03, along(p, K, thigh))
    const atAnkle = smooth(-0.025, 0.025, along(p, A, shin))
    add(`hip-${s}`, leg * (1 - atKnee))
    add(`knee-${s}`, leg * atKnee * (1 - atAnkle))
    add(`ankle-${s}`, leg * atKnee * atAnkle)
  }

  // The rest belongs to the trunk: lower trunk on the root, upper trunk
  // (and anything attached to the arms) on the spine.
  const rest = Math.max(0, 1 - arm - leg)
  const upperTrunk = arm > 0 ? 1 : smooth(-0.06, 0.06, p[1] - joints.spine[1])
  add('spine', rest * upperTrunk)
  add('root', rest * (1 - upperTrunk))
  return w
}

/**
 * JOINTS_0 / WEIGHTS_0 arrays (4 influences) for a position array, either
 * smoothly weighted from a hint or rigidly bound to `rigid(position)`.
 */
export function skinAttributes(positions, hint, joints, rigid) {
  const n = positions.length / 3
  const jointsOut = new Uint8Array(n * 4)
  const weightsOut = new Float32Array(n * 4)
  for (let i = 0; i < n; i++) {
    const p = [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]]
    if (rigid) {
      jointsOut[i * 4] = J[rigid(p)]
      weightsOut[i * 4] = 1
      continue
    }
    const top = Object.entries(vertexWeights(p, hint, joints))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
    const total = top.reduce((acc, [, v]) => acc + v, 0) || 1
    top.forEach(([j, v], k) => {
      jointsOut[i * 4 + k] = Number(j)
      weightsOut[i * 4 + k] = v / total
    })
  }
  return { joints: jointsOut, weights: weightsOut }
}
