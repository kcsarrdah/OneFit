# `src/features/body-3d/modelNodes.test.ts`

## Purpose

Tests the node-name parser and validates the committed `public/models/body.glb`
against the viewer's expectations and the backend content.

## Public API

| Block › test | Covers |
|---|---|
| `parseNodeName` › parses muscle nodes, including hyphenated ids | `muscle-upper-back-l`, `muscle-chest-r` |
| `parseNodeName` › recognises bones and context meshes | `bones`, `context`, `head`, `fat-trunk`, `fat-leg-r`; `fat-leg` is unknown |
| `parseNodeName` › recognises rig joints | `joint-shoulder-l`, `joint-spine` |
| `parseNodeName` › rejects anything else | `muscle:chest:l`, bad side `x` |
| `public/models/body.glb` › is rigged | Every mesh node has a skin whose joints include `joint-root` and all 13 `POSABLE_JOINTS` |
| … › only contains nodes the viewer understands | No node parses as `unknown` |
| … › has a sculpted head instead of a skull | A `head` node exists |
| … › has a separate fat layer over the whole body, with its areas | `fat-trunk`, `fat-arm-l/r`, `fat-leg-l/r` exist with `extras.area > 0.1` m² and `weightedArea > 0` |
| … › has a left and right mesh for every muscle the API serves | Each id in `backend/data/muscles.json` has `l` and `r` nodes |
| … › has no muscle meshes the API does not know about | Every muscle node's id is in the backend content |

## How it works

`glbJson()` reads only the GLB's JSON chunk (magic `glTF`, chunk type `JSON`)
with `node:fs`; no geometry is decoded, so the test is fast and needs no
meshopt decoder.

## Depends on

Vitest, `node:fs`, `public/models/body.glb`, `backend/data/muscles.json`,
[posePresets](posePresets.md) (`POSABLE_JOINTS`).

## Used by

`npm test`.

## Tests

This is a test file.

## Gotchas / TODO

Not covered: geometry (vertex counts, `_AO`/`_FATW`/`_VISC` attributes present
and in range), joint positions, `visceralArea`/`weightMax` extras, that every
mesh shares the same joint nodes.
