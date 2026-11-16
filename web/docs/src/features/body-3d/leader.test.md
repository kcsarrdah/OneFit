# `src/features/body-3d/leader.test.ts`

## Purpose

Unit tests for [leader.ts](leader.md).

## Public API

`describe('leaderPoints')`:

- runs from the anchor to the near edge of a panel on the right
- enters the panel near its header even when the anchor is low
- works with a panel on the left
- returns null when the panel is stacked below the anchor (mobile layout)
- returns null when the anchor is too close to the panel to draw an elbow

`describe('toSvgPoints')`: formats points with one decimal.

## How it works

Pure functions.

## Depends on

Vitest.

## Used by

`npm test`.

## Tests

This is a test file.

## Gotchas / TODO

Not covered: custom `elbow`/`inset` options, very short panels (where `maxY`
falls back to `minY`), and the projection/occlusion logic in
[BodyViewer](BodyViewer.md) that feeds the anchor point.
