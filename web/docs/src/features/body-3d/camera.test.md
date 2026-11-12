# `src/features/body-3d/camera.test.ts`

## Purpose

Unit tests for [camera.ts](camera.md).

## Public API

| Block | Covers |
|---|---|
| `normalizeAzimuth` (5 parametrised cases) | 0, 2π, 3π, -3π/2, 7π/2 wrap to 0, 0, π, π/2, -π/2 |
| `viewForAzimuth` | Front half-circle after any number of full turns |
| `shortestAzimuth` | Short way round after several spins; no move when already there |
| `viewForMuscle` | Stays when visible, turns when not, stays when the muscle has no views |
| `focusTargetY` | Moves toward the muscle but keeps the figure framed (clamps) |

## How it works

Pure functions.

## Depends on

Vitest.

## Used by

`npm test`.

## Tests

This is a test file.

## Gotchas / TODO

Not covered: the constants themselves, how `BodyViewer` combines these with
`scaleY`.
