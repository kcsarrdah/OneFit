# `src/features/body-3d/pose.ts`

## Purpose

Joint limits and pose maths (three.js side): clamps joint rotations to an
anatomical range, turns a `Pose` into quaternions, and maps a dragged vertex to
the joint it should rotate.

## Public API

- Re-exports `POSABLE_JOINTS`, `POSE_PRESETS`, `JointName`, `Pose`,
  `PosePreset` from [posePresets](posePresets.md).
- `clampJointDegrees(joint, [x, y, z]): [x, y, z]`.
- `clampJointQuaternion(joint, q: Quaternion): Quaternion` (mutates and returns `q`).
- `poseQuaternions(pose): Record<JointName, Quaternion>`: every posable joint,
  identity where the pose omits it.
- `dragJointFor(skinJoint: string): JointName | null`: `null` for `root` or
  unknown names.

## How it works

`LIMITS` holds per-axis degree ranges for the left side, by joint kind:

| Kind | X | Y | Z |
|---|---|---|---|
| spine | -25..60 | -35..35 | -30..30 |
| shoulder | -180..60 | -90..90 | -30..180 |
| elbow | -150..5 | -80..80 | -5..150 |
| wrist | -70..70 | -30..30 | -40..40 |
| hip | -125..35 | -45..45 | -25..60 |
| knee | 0..150 | 0..0 | 0..0 |
| ankle | -45..30 | -20..20 | -20..20 |

For `-r` joints the Y and Z ranges are mirrored (`[a, b] → [-b, -a]`). `+ 0`
normalises `-0` from mirrored zero ranges. Quaternions are clamped by going
through XYZ Euler angles.

## Depends on

three (`Euler`, `MathUtils`, `Quaternion`), [posePresets](posePresets.md).

## Used by

[BodyModel](BodyModel.md) (targets, drag clamping, drag joint lookup).

## Tests

[pose.test](pose.test.md).

## Gotchas / TODO

- Clamping per Euler axis is an approximation: near ±90° on Y, XYZ Euler
  decomposition is unstable (gimbal lock), so a dragged shoulder can jump when
  clamped.
