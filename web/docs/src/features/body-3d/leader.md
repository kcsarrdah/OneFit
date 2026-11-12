# `src/features/body-3d/leader.ts`

## Purpose

Geometry of the callout ("leader") line from the selected muscle to the info
panel, in screen pixels. Pure, so it can be unit-tested.

## Public API

- `interface Point { x, y }`, `interface Rect { left, top, width, height }`.
- `leaderPoints(anchor: Point, panel: Rect, opts?: { elbow?: number = 56; inset?: number = 28 }): Point[] | null`:
  three points `[anchor, knee, panelEdge]`, or `null` when there is no room.
- `toSvgPoints(points): string`: `"x,y x,y ..."` with one decimal.

## How it works

1. Pick the panel edge facing the anchor (left edge if the panel is to the
   right, right edge if it is entirely to the left).
2. Return `null` if the horizontal gap is under `elbow / 2` (e.g. the mobile
   layout, where the panel is stacked below the stage).
3. The end point's y follows the anchor but is clamped to
   `[panel.top + inset, min(panel.bottom - inset, panel.top + 160)]`, so the
   line enters near the panel's header.
4. The knee sits `min(elbow, gap / 2)` px from the anchor toward the panel at
   the end point's height: a short diagonal, then a horizontal run.

## Depends on

none.

## Used by

[BodyViewer](BodyViewer.md) (`useLeaderLine`).

## Tests

[leader.test](leader.test.md).

## Gotchas / TODO

none.
