# `src/features/body-map/bodyPaths.ts`

## Purpose

Hand-drawn SVG geometry for the 2D fallback body map.

## Public API

- `VIEWBOX = { width: 200, height: 440 }`.
- `interface MuscleShape { id: string; paths: string[] }`.
- `interface BodyFigure { silhouette: string; head: string; muscles: MuscleShape[]; details: string[] }`.
- `FIGURES: Record<BodyView, BodyFigure>`: `front` and `back`.
- `musclesOnView(view): Set<string>`.

## How it works

Only the viewer's left half (x ≤ 100) is drawn; [BodyMap](BodyMap.md) mirrors
it. Front and back share the silhouette and head path. Muscle ids must match
`backend/data/muscles.json`, and each figure must contain exactly the muscles
whose `views` include that side.

To add a muscle: add its `views` in the backend content, then add its paths to
the matching figure(s) here (and to the 3D model; see
[build-body-model](../../../scripts/build-body-model.md)).

## Depends on

[anatomy types](../../api/anatomy.md) (`BodyView`).

## Used by

[BodyMap](BodyMap.md), [BodyMap.test](BodyMap.test.md).

## Tests

[BodyMap.test](BodyMap.test.md) (`bodyPaths` block: ids per view match the backend).

## Gotchas / TODO

- `musclesOnView` is exported but unused anywhere in `src/` (dead code under
  rule 3 of `CLAUDE.md`).
