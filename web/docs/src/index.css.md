# `src/index.css`

## Purpose

Tailwind v4 entry, design tokens, the four page themes, and the few hand-written
styles that utilities cannot express (2D map states, range sliders, panel and
leader-line animations).

## Public API

**Tokens (`@theme`)**, which become Tailwind utilities (`bg-ink-900`,
`text-accent`, `font-display`, ...):

- `--font-sans` (Inter), `--font-display` (Rajdhani; Oswald in the gym themes).
- `--color-ink-950 … ink-100`: the neutral ramp (only 950/900/800/700/600/400/300/100 exist).
- `--color-accent`, `--color-accent-soft` (20% accent via `color-mix`), `--color-warm`.
- `--color-body-skin`, `--color-body-detail`, `--color-muscle`,
  `--color-muscle-hover`, `--color-muscle-selected`: the 2D body map.

**Themes**: `[data-theme='hologram']` (also `:root`), `iron`, `volt`, `steel`.
Each overrides the ink ramp, accent, warm, body colours, plus page-only
variables `--glow-top`, `--glow-bottom`, `--texture`.

**Classes**

| Class | Use |
|---|---|
| `.stripe-bar` | Hazard-stripe accent bar under the header |
| `.section-title` | Small uppercase section heading (MuscleDetail) |
| `.muscle[data-state=idle\|hovered\|selected]` | 2D map muscle fills, plus a focus ring on `:focus-visible` |
| `.range` | Styled `<input type=range>`; reads `--fill` (filled %) and `--mark` (default-value tick %) |
| `.range-bands` | Variant whose track is `--bands` (coloured body-fat ranges), dimmed past `--fill` |
| `.panel-enter` | Slide/fade-in of the detail panel and its children (2nd child delayed 60 ms) |
| `.leader-dot` | Pulsing radius of the leader line's anchor dot |

## How it works

Tailwind utilities read the CSS variables, so setting `data-theme` on `<html>`
re-skins the page with no re-render. The body background stacks two radial
"glow" gradients and two diagonal repeating gradients (`--texture`, a bar-grip
knurl) with `background-attachment: fixed`. `prefers-reduced-motion: reduce`
disables the panel and leader-dot animations.

## Depends on

Tailwind CSS v4 (`@import 'tailwindcss'`, `@theme`, `@apply`, `@layer`).

## Used by

[main.tsx](main.md) imports it. Theme values must match
[`theme/themes.ts`](theme/themes.md) (the 3D scene cannot read CSS variables).
Slider variables are set by [BodyProfilePanel](features/profile/BodyProfilePanel.md);
`.muscle` by [BodyMap](features/body-map/BodyMap.md); `.leader-dot` by
[BodyViewer](features/body-3d/BodyViewer.md).

## Tests

none (Vitest runs with `css: false`). [themes.test](theme/themes.test.md) only
checks the TS side.

## Gotchas / TODO

- Accent colours are duplicated here and in `themes.ts`; nothing checks they agree.
- `:root` and `hologram` share defaults; `index.html` sets `data-theme="iron"`,
  so the `:root` values only show if the attribute is removed.
- `.leader-dot` animates the SVG `r` geometry property from CSS; browsers that
  do not support CSS geometry properties simply show a static dot.
- `CLAUDE.md` describes the product as dark-only Iron; Volt, Steel and Hologram
  still exist here.
