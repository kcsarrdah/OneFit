# `scripts/lib/rig.test.mjs`

## Purpose

Unit tests for [rig.mjs](rig.md), run by Vitest with the app's tests
(`npm test`), using hand-written joint positions close to the built model.

## Public API

| Block › test | Covers |
|---|---|
| `boneJoint` › binds limb bones to the joint they rotate about | humerus, ulna, thumb phalanx, femur, patella, calcaneus |
| `boneJoint` › keeps the trunk and the shoulder blade off the arm chain | scapula and ribs → spine; sacrum and lumbar → root |
| `vertexWeights` › always sums to one | One point per hint (`arm`, `shoulder`, `leg`, `hip`, `torso`) |
| `vertexWeights` › splits the arm at the elbow | Upper arm mostly `shoulder-l`, forearm mostly `elbow-l` |
| `vertexWeights` › uses the correct side | A -X leg point uses `hip-r`, never `hip-l` |
| `vertexWeights` › leaves torso muscles on the trunk | Upper torso point → only `spine` |
| `skinAttributes` › binds rigid vertices to a single joint with full weight | `[elbow-l]`, weights `[1, 0, 0, 0]` |

## How it works

Pure functions. It imports from `vitest`, so it does not run under
`node --test`.

## Depends on

Vitest.

## Used by

`npm test`.

## Tests

This is a test file.

## Gotchas / TODO

Not covered: `computeJoints` (needs source bone data), the `auto` hint,
`contextHint`/`muscleHint`, the top-4 truncation in `skinAttributes`.
