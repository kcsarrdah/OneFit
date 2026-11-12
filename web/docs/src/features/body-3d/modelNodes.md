# `src/features/body-3d/modelNodes.ts`

## Purpose

The naming contract between `public/models/body.glb` (written by
[build-body-model.mjs](../../../scripts/build-body-model.md)) and the viewer:
how a node name maps to what it is.

## Public API

- `MODEL_URL = '/models/body.glb'`.
- `type Side = 'l' | 'r' | 'c'`.
- `type ModelNode` (discriminated on `kind`):
  `muscle { muscleId, side }`, `context`, `bones`, `head`, `fat { part }`,
  `joint { joint }`, `unknown`.
- `parseNodeName(name): ModelNode`.

| Node name | Kind | Meaning |
|---|---|---|
| `muscle-<id>-<l\|r\|c>` | `muscle` | Selectable muscle group, one node per side. `<id>` may contain hyphens (`upper-back`) and must be an id from `backend/data/muscles.json` |
| `context` | `context` | All other muscles, rendered but not selectable |
| `bones` | `bones` | The skeleton (minus the skull), one mesh |
| `head` | `head` | The sculpted mannequin head that replaces the skull |
| `fat-trunk`, `fat-arm-l/r`, `fat-leg-l/r` | `fat` | Subcutaneous fat envelopes; node `extras` hold `area`, `weightedArea`, `visceralArea`, `weightMax` |
| `joint-<name>` | `joint` | Rig joints: `root`, `spine`, `shoulder/elbow/wrist/hip/knee/ankle-<l\|r>` |

## How it works

Regexes, checked in order: exact `bones`/`head`/`context`, then
`^fat-(trunk|(?:arm|leg)-[lr])$`, `^joint-([a-z]+(?:-[lr])?)$`,
`^muscle-([a-z0-9-]+)-([lrc])$`. Names avoid `:`, `.`, `/` and brackets
because three's `GLTFLoader` strips them from node names.

## Depends on

none.

## Used by

[BodyModel](BodyModel.md) (classifies every `SkinnedMesh`, loads `MODEL_URL`).

## Tests

[modelNodes.test](modelNodes.test.md), which also checks the real GLB.

## Gotchas / TODO

- Changing a name pattern means changing the build script, this parser and the
  test together, then rebuilding the model.
- `[a-z]+` in the joint regex would not match a joint name with digits.
