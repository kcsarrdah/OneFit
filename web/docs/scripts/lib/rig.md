# `scripts/lib/rig.mjs`

## Purpose

A light skeleton for posing the figure, and per-vertex skin weights so muscles
bend around joints instead of tearing.

## Public API

| Export | Meaning |
|---|---|
| `JOINTS` | `{ name, parent }[]` in glTF skin order: `root`; `spine` (root); `shoulder/elbow/wrist-l/r` (spine chain); `hip/knee/ankle-l/r` (root chain). The app looks joints up by name |
| `muscleHint(muscleId)` | `'arm'` (biceps, triceps, forearms), `'shoulder'` (delts), `'leg'` (quads, hamstrings, calves, shins, adductors), `'hip'` (glutes), else `'torso'` |
| `contextHint(slug)` | Hint for context muscles: iliacus/psoas → `hip`; popliteus, tibialis posterior, toe flexors → `leg`; else `torso` |
| `boneJoint(slug, side)` | The one joint a bone moves with: humerus → shoulder, radius/ulna → elbow, hand bones → wrist, femur → hip, patella/tibia/fibula → knee, foot bones → ankle, lumbar/sacrum/pelvis → root, everything else (ribs, thoracic/cervical spine, scapula, clavicle) → spine |
| `computeJoints(bySlug)` | Joint world positions from bone landmarks |
| `vertexWeights(p, hint, joints)` | `{ jointIndex: weight }` summing to 1 |
| `skinAttributes(positions, hint, joints, rigid?)` | `{ joints: Uint8Array, weights: Float32Array }` (4 influences per vertex) |

## How it works

**Joint landmarks** (`computeJoints`): spine = centroid of the first lumbar
vertebra; shoulder = top 4 cm of the humerus minus the outer greater tubercle;
elbow = bottom 2.5 cm of the humerus; wrist = bottom 2 cm of radius + ulna;
hip = medial half of the top 5 cm of the femur (the femoral head); knee =
bottom 3 cm of the femur, 1 cm lower; ankle = bottom 2 cm of the tibia. Root is
the origin.

**Weights** (`vertexWeights`): first decide how much a vertex belongs to the
arm or leg chain (0..1):

- `arm` hint: 1. `shoulder`: smoothstep past the shoulder along the upper arm.
  `leg`: smoothstep past the hip along the thigh. `hip`: up to 0.4 past the hip.
- `auto` (fat envelopes and context classification): by distance (< 6 cm) to
  the arm segments (shoulder-elbow-wrist-hand) or leg segments
  (hip-knee-ankle-foot), plus lateral/height checks.

Within a chain, smoothsteps across each joint split the weight (shoulder →
elbow over ±2.5 cm, elbow → wrist ±2 cm, hip → knee ±3 cm, knee → ankle
±2.5 cm). The remainder goes to the trunk: `spine` above the spine joint,
`root` below, blended over ±6 cm (all of it to `spine` for arm-attached
vertices). `skinAttributes` keeps the top 4 weights and renormalises, or binds
everything to `rigid(p)` with weight 1.

## Depends on

none (pure JS).

## Used by

[build-body-model](../build-body-model.md).

## Tests

[rig.test](rig.test.md).

## Gotchas / TODO

- The `vertexWeights` doc comment refers to `skinHint()`, which does not exist;
  hints come from `muscleHint`/`contextHint`.
- Side is decided by the sign of x, so a vertex exactly on the midline goes to
  the left chain.
- Joint names here, `POSABLE_JOINTS` in
  [posePresets](../../src/features/body-3d/posePresets.md) and the regex in
  [modelNodes](../../src/features/body-3d/modelNodes.md) must agree.
