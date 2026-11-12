# `src/features/body-3d/camera.ts`

## Purpose

Pure camera helpers: which side is shown, shortest turns, and where to look
when focusing a muscle.

## Public API

| Export | Meaning |
|---|---|
| `BODY_HEIGHT = 1.71` | Figure height in metres (source model) |
| `BODY_CENTER_Y = BODY_HEIGHT × 0.47` | Default look-at height |
| `VIEW_AZIMUTH` | `{ front: 0, back: π }` (the figure faces +Z) |
| `DISTANCE` | `{ overview: 3.9, min: 1.1, max: 6 }` |
| `normalizeAzimuth(a)` | Wraps to (-π, π] |
| `viewForAzimuth(a)` | `'front'` when \|a\| ≤ π/2, else `'back'` |
| `shortestAzimuth(current, target)` | `current + normalizeAzimuth(target - current)`: never spins the long way, keeps accumulated turns |
| `viewForMuscle(views, current)` | Stay on `current` if the muscle is visible there (or has no views), else `views[0]` |
| `focusTargetY(y)` | Look-at height moved 12% of the way from the centre toward `y`, clamped to [0.5, 1.31] |

## How it works

All in an unscaled figure; [BodyViewer](BodyViewer.md) divides by `scaleY`
before calling `focusTargetY` and multiplies after.

## Depends on

[anatomy types](../../api/anatomy.md).

## Used by

[BodyViewer](BodyViewer.md), [BodyModel](BodyModel.md) (`VIEW_AZIMUTH`),
[App](../../App.md) (`viewForMuscle`).

## Tests

[camera.test](camera.test.md).

## Gotchas / TODO

none.
