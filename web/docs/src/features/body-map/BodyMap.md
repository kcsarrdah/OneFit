# `src/features/body-map/BodyMap.tsx`

## Purpose

2D SVG body diagram used when the browser has no WebGL2. Clickable, hoverable
and keyboard-accessible muscles for the current side.

## Public API

`BodyMap(props)`:

| Prop | Type | Meaning |
|---|---|---|
| `view` | `BodyView` | Which figure from `FIGURES` to draw |
| `selectedId`, `hoveredId` | `string \| null` | Drive `data-state` on each muscle |
| `names` | `Record<string, string>` | Accessible labels by muscle id (falls back to the id) |
| `onSelect` | `(id) => void` | Click, Enter or Space |
| `onHover` | `(id \| null) => void` | Pointer enter/leave and focus/blur |

## How it works

[bodyPaths](bodyPaths.md) only holds the viewer's left half. `BodyMap` draws
that half, then the same half again with
`matrix(-1 0 0 1 200 0)` (mirror across x = 100). Only the first half is
accessible: its muscle `<g>`s have `role="button"`, `tabIndex=0`,
`aria-label`, `aria-pressed`; the mirrored half is `aria-hidden` and not
focusable, but still clickable. Colours come from `.muscle[data-state]` in
[index.css](../../index.css.md); the selected muscle gets an SVG glow filter
(unique id via `useId`). Detail lines are drawn on top with
`pointer-events: none`. The `<svg>` is `role="group"` labelled
"Body diagram, front view" / "back view".

## Depends on

[bodyPaths](bodyPaths.md), [anatomy types](../../api/anatomy.md).

## Used by

[App](../../App.md) (when `supportsWebGL()` is false).

## Tests

[BodyMap.test](BodyMap.test.md), [App.test](../../App.test.md).

## Gotchas / TODO

- Muscles shown only on one view (per `backend/data/muscles.json`) must be
  drawn only in that figure; `BodyMap.test` enforces it.
