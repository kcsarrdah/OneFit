# `src/features/roster/MuscleRoster.tsx`

## Purpose

Searchable list of all muscles, grouped by region, synced with the figure's
selection and hover.

## Public API

`MuscleRoster(props)`:

| Prop | Type | Meaning |
|---|---|---|
| `muscles` | `MuscleSummary[]` | From `useMuscles()` |
| `selectedId` | `string \| null` | Highlighted row (`aria-current`) |
| `hoveredId` | `string \| null` | Hover-highlighted row (hover on the figure shows here too) |
| `onSelect` | `(id) => void` | Row click |
| `onHover` | `(id \| null) => void` | Pointer enter / leave |

## How it works

Local `query` state filters case-insensitively on `name` and
`scientific_names`. Groups are emitted in the order Upper body, Core, Lower
body; empty groups are dropped, and "No muscles match" shows when nothing
matches. Each row shows the muscle's `views` ("front · back"). Rendered inside
a `Panel` with a `<nav aria-label="Muscles">`.

## Depends on

[ui](../../components/ui.md) (`Panel`), [anatomy types](../../api/anatomy.md).

## Used by

[App](../../App.md).

## Tests

[App.test](../../App.test.md) (clicking a back-only muscle in the roster). No
dedicated suite: search filtering is untested.

## Gotchas / TODO

- Hover uses pointer events only; keyboard focus on a row does not set
  `hoveredId` (the 2D map does).
