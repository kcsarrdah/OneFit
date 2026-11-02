// Pose data only (no three.js), so the page can list presets without
// loading the 3D chunk.

/** Joints in public/models/body.glb (see scripts/lib/rig.mjs), named `joint-<name>`. */
export const POSABLE_JOINTS = [
  'spine',
  'shoulder-l',
  'elbow-l',
  'wrist-l',
  'shoulder-r',
  'elbow-r',
  'wrist-r',
  'hip-l',
  'knee-l',
  'ankle-l',
  'hip-r',
  'knee-r',
  'ankle-r',
] as const
export type JointName = (typeof POSABLE_JOINTS)[number]

/** Joint rotations as XYZ Euler angles in degrees, relative to the rest pose. */
export type Pose = Partial<Record<JointName, [number, number, number]>>

// Axes: the figure faces +Z, its left is +X. Raising the left arm sideways
// is +Z, raising either arm forward is -X, bending the trunk forward is +X,
// flexing a hip is -X and a knee +X. Right-side Z/Y angles are mirrored.

export const POSE_PRESETS = {
  relaxed: { label: 'Relaxed', pose: {} },
  tpose: {
    label: 'T-pose',
    pose: { 'shoulder-l': [0, 0, 78], 'shoulder-r': [0, 0, -78] },
  },
  reach: {
    label: 'Reach up',
    pose: { 'shoulder-l': [0, 0, 158], 'shoulder-r': [0, 0, -158], spine: [-4, 0, 0] },
  },
  flex: {
    label: 'Flex',
    pose: {
      'shoulder-l': [0, 0, 80],
      'shoulder-r': [0, 0, -80],
      'elbow-l': [0, 0, 105],
      'elbow-r': [0, 0, -105],
    },
  },
  squat: {
    label: 'Squat',
    pose: {
      spine: [28, 0, 0],
      'shoulder-l': [-75, 0, 4],
      'shoulder-r': [-75, 0, -4],
      'hip-l': [-95, 0, 8],
      'hip-r': [-95, 0, -8],
      'knee-l': [105, 0, 0],
      'knee-r': [105, 0, 0],
      'ankle-l': [-12, 0, 0],
      'ankle-r': [-12, 0, 0],
    },
  },
  lunge: {
    label: 'Lunge',
    pose: {
      spine: [6, 0, 0],
      'hip-l': [-80, 0, 0],
      'knee-l': [85, 0, 0],
      'hip-r': [20, 0, 0],
      'knee-r': [72, 0, 0],
      'ankle-r': [25, 0, 0],
      'shoulder-l': [20, 0, 6],
      'shoulder-r': [-25, 0, -6],
    },
  },
} satisfies Record<string, { label: string; pose: Pose }>
export type PosePreset = keyof typeof POSE_PRESETS
