# `src/features/body-3d/pose.test.ts`

## Purpose

Unit tests for [pose.ts](pose.md) and the presets in [posePresets](posePresets.md).

## Public API

| Block › test | Covers |
|---|---|
| `presets` › only reference real joints and stay within joint limits | Every preset joint is in `POSABLE_JOINTS`; clamping leaves preset angles unchanged |
| `presets` › mirror the arms | T-pose moves the left arm to +X and the right to -X |
| `presets` › bends knees backwards and hips forwards in a squat | Thigh points +Z, shin folds back (-Z) |
| `presets` › rest pose is identity everywhere | `poseQuaternions({})` |
| `joint limits` › stops knees bending forwards | `knee-l [-40, 10, 10] → [0, 0, 0]` |
| `joint limits` › mirrors side-specific limits for the right side | `shoulder-r` accepts -170 on Z, clamps +170 to 30 |
| `joint limits` › clamps quaternions | A -90° knee quaternion clamps to 0 |
| `dragJointFor` › maps skin joints to draggable joints | `elbow-l` → itself; `root` and unknown → `null` |

## How it works

Pure maths with three's `Quaternion`/`Vector3`; no rendering.

## Depends on

Vitest, three.

## Used by

`npm test`.

## Tests

This is a test file.

## Gotchas / TODO

Not covered: the drag interaction itself (pointer → plane → rotation in
[BodyModel](BodyModel.md)), foot planting, the age stoop added to the spine.
