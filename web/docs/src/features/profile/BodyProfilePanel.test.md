# `src/features/profile/BodyProfilePanel.test.tsx`

## Purpose

Component tests for [BodyProfilePanel](BodyProfilePanel.md), rendered in a
small `Harness` that holds profile, units and `showFat` in `useState`.

## Public API

`describe('BodyProfilePanel')`:

| Test | Covers |
|---|---|
| updates values, BMI and category as sliders move | Default `171 cm` / Healthy range; weight 110 → `110 kg`, BMI `37.6`, Obese; age 64 → `64 yrs` |
| explains the current body fat range and composition | Default band Fit; 8% → Shredded with its first "looks" line, lean `64 kg`, fat `6 kg`; 35% → High |
| maps where the fat is, and grows it with body fat | Belly thickness at 30% > 1.8 × at 15%; the Layer switch toggles `aria-checked` |
| switches units without changing the body | `ft·lb` shows `5′ 7″`, `154 lb`, and the height slider's `aria-valuetext` |
| offers a reset only after a change | Reset hidden at default, shown after a height change, restores `171 cm` |

## How it works

Sliders are driven with `fireEvent.change` (jsdom range inputs), buttons with
`userEvent`.

## Depends on

Testing Library, Vitest, [profile](../body-3d/profile.md).

## Used by

`npm test`.

## Tests

This is a test file.

## Gotchas / TODO

Not covered: the slider track CSS variables (`--fill`, `--mark`, `--bands`),
FFMI display, the visceral/subcutaneous litres text, every band's range label.
