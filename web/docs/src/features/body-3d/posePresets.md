# `src/features/body-3d/posePresets.ts`

## Purpose

Pose data with no three.js import, so the page can list presets without loading
the 3D chunk.

## Public API

- `POSABLE_JOINTS` (readonly tuple): `spine`, `shoulder-l`, `elbow-l`,
  `wrist-l`, `shoulder-r`, `elbow-r`, `wrist-r`, `hip-l`, `knee-l`, `ankle-l`,
  `hip-r`, `knee-r`, `ankle-r`. They match `joint-<name>` nodes in the GLB
  ([rig.mjs](../../../scripts/lib/rig.md) `JOINTS`, minus `root`).
- `type JointName`, `type Pose = Partial<Record<JointName, [x, y, z]>>`: XYZ Euler
  degrees relative to the rest pose.
- `POSE_PRESETS`: `relaxed` (empty), `tpose`, `reach` (Reach up), `flex`,
  `squat`, `lunge`, each `{ label, pose }`.
- `type PosePreset = keyof typeof POSE_PRESETS`.

## How it works

Axis conventions (figure faces +Z, its left is +X): raising the left arm
sideways is +Z; raising either arm forward is -X; bending the trunk forward is
+X; flexing a hip is -X; bending a knee is +X. Right-side Y/Z angles are
mirrored (negated), e.g. T-pose is `shoulder-l [0,0,78]`, `shoulder-r [0,0,-78]`.

## Depends on

none.

## Used by

[App](../../App.md) (preset buttons, `Pose` state), [pose.ts](pose.md)
(re-exports everything), [modelNodes.test](modelNodes.test.md).

## Tests

[pose.test](pose.test.md) (presets stay within joint limits and behave as
expected).

## Gotchas / TODO

- Presets must stay within the limits in [pose.ts](pose.md); the test fails
  otherwise.
