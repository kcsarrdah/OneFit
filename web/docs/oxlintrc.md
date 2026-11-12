# `.oxlintrc.json`

(Doc named without the leading dot so it is not a hidden file.)

## Purpose

Configuration for `npm run lint` (oxlint).

## Public API

- Plugins: `react`, `typescript`, `oxc`.
- `react/rules-of-hooks`: error.
- `react/only-export-components`: warn, with `allowConstantExport: true` (keeps
  Fast Refresh working while allowing exported constants next to components).
- Override for `src/features/body-3d/**`: `react/immutability` off.

## How it works

The 3D code mutates three.js objects, shader uniforms and refs inside
`useFrame` every frame (for example `shared.uInflate.value += ...` in
[BodyModel](src/features/body-3d/BodyModel.md) and the SVG attributes of the
leader line in [BodyViewer](src/features/body-3d/BodyViewer.md)). That is
deliberate (no React re-render per frame), so the immutability rule is off for
that folder only.

## Depends on

`oxlint` (schema at `node_modules/oxlint/configuration_schema.json`).

## Used by

`npm run lint`.

## Tests

none. `npm run lint` reported no findings on 2026-11-12.

## Gotchas / TODO

- `scripts/` is linted with the same browser-oriented rules; there is no
  Node-specific override.
