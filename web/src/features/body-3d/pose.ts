import { Euler, MathUtils, Quaternion } from 'three'

import { POSABLE_JOINTS, type JointName, type Pose } from './posePresets'

export { POSABLE_JOINTS, POSE_PRESETS, type JointName, type Pose, type PosePreset } from './posePresets'

type Range = [number, number]
/** Per-axis limits in degrees, written for the left side (mirrored for the right). */
const LIMITS: Record<string, { x: Range; y: Range; z: Range }> = {
  spine: { x: [-25, 60], y: [-35, 35], z: [-30, 30] },
  shoulder: { x: [-180, 60], y: [-90, 90], z: [-30, 180] },
  elbow: { x: [-150, 5], y: [-80, 80], z: [-5, 150] },
  wrist: { x: [-70, 70], y: [-30, 30], z: [-40, 40] },
  hip: { x: [-125, 35], y: [-45, 45], z: [-25, 60] },
  knee: { x: [0, 150], y: [0, 0], z: [0, 0] },
  ankle: { x: [-45, 30], y: [-20, 20], z: [-20, 20] },
}

function limitsFor(joint: JointName) {
  const [kind, side] = joint.split('-') as [string, 'l' | 'r' | undefined]
  const l = LIMITS[kind]
  if (side !== 'r') return l
  // Mirror across the body: Y and Z rotations flip sign on the right side.
  const flip = ([a, b]: Range): Range => [-b, -a]
  return { x: l.x, y: flip(l.y), z: flip(l.z) }
}

/** Clamps a joint rotation (degrees) to its anatomical range. */
export function clampJointDegrees(joint: JointName, [x, y, z]: [number, number, number]): [number, number, number] {
  const l = limitsFor(joint)
  // `+ 0` turns -0 (from mirrored zero ranges) into 0.
  return [MathUtils.clamp(x, ...l.x) + 0, MathUtils.clamp(y, ...l.y) + 0, MathUtils.clamp(z, ...l.z) + 0]
}

const toEuler = ([x, y, z]: [number, number, number]) =>
  new Euler(MathUtils.degToRad(x), MathUtils.degToRad(y), MathUtils.degToRad(z), 'XYZ')

/** Clamps a joint's quaternion in place to its anatomical range. */
export function clampJointQuaternion(joint: JointName, q: Quaternion): Quaternion {
  const e = new Euler().setFromQuaternion(q, 'XYZ')
  const deg = clampJointDegrees(joint, [MathUtils.radToDeg(e.x), MathUtils.radToDeg(e.y), MathUtils.radToDeg(e.z)])
  return q.setFromEuler(toEuler(deg))
}

/** Target quaternions for every posable joint (rest = identity). */
export function poseQuaternions(pose: Pose): Record<JointName, Quaternion> {
  const out = {} as Record<JointName, Quaternion>
  for (const j of POSABLE_JOINTS) {
    const deg = clampJointDegrees(j, pose[j] ?? [0, 0, 0])
    out[j] = new Quaternion().setFromEuler(toEuler(deg))
  }
  return out
}

/** Which joint a drag should rotate, given the joint a vertex is mostly skinned to. */
export function dragJointFor(skinJoint: string): JointName | null {
  if (skinJoint === 'root') return null
  return (POSABLE_JOINTS as readonly string[]).includes(skinJoint) ? (skinJoint as JointName) : null
}
