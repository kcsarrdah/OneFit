# `src/features/body-3d/styles.ts`

## Purpose

The list of figure "looks", without importing three.js, so the page's Look
picker does not pull in the 3D chunk.

## Public API

- `type BodyStyle = 'hologram' | 'anatomical' | 'sculpt'`.
- `BODY_STYLES: { value, label, hint }[]`: Hologram ("Muscles with a glowing
  x-ray skeleton"), Anatomy ("Textbook colours with ivory bone"), Sculpt
  ("Clean single-tone figure").

## How it works

Data only. The materials for each look are in [bodyMaterials](bodyMaterials.md).

## Depends on

none.

## Used by

[App](../../App.md) (Look picker, `isStyle` validator),
[bodyMaterials](bodyMaterials.md) (re-exports the type).

## Tests

none directly.

## Gotchas / TODO

- Adding a look means adding a palette in `bodyMaterials.ts`
  (`BASE_PALETTES` and the `create*Material` branches) and a swatch in
  `App.tsx` (`STYLE_SWATCH`).
