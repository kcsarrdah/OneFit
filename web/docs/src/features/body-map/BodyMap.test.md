# `src/features/body-map/BodyMap.test.tsx`

## Purpose

Tests for [BodyMap](BodyMap.md) and the data contract of [bodyPaths](bodyPaths.md).

## Public API

| Block / test | Covers |
|---|---|
| `BodyMap` › selects a muscle on click, from either side of the body | Clicking the accessible half and the mirrored half both call `onSelect('chest')` |
| `BodyMap` › exposes one focusable control per muscle and selects with the keyboard | One `button` per muscle in the back figure (mirrored half hidden from the a11y tree), `aria-pressed` on the selected one, Enter selects |
| `bodyPaths` › front / back figure matches backend muscle views | Sorted muscle ids in each figure equal the ids in `backend/data/muscles.json` whose `views` include that side |

## How it works

The `bodyPaths` block reads `../../../../backend/data/muscles.json` from disk,
so it fails if the backend content and the 2D drawing disagree.

## Depends on

Testing Library, Vitest, `node:fs`, the backend content file.

## Used by

`npm test`.

## Tests

This is a test file.

## Gotchas / TODO

Not covered: hover/focus calling `onHover`, Space key, the glow filter, visual
correctness of the paths. Needs the `backend/` folder next to `web/`.
