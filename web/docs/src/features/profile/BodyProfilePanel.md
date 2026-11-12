# `src/features/profile/BodyProfilePanel.tsx`

## Purpose

"Your body" panel: height, weight, body fat and age sliders that reshape the
3D figure, with BMI, FFMI, lean/fat mass, a fat map, a body-fat range guide,
units and the fat layer toggle.

## Public API

`BodyProfilePanel(props)`:

| Prop | Type | Meaning |
|---|---|---|
| `profile` | `BodyProfile` | Already clamped (see [profile](../body-3d/profile.md) `clampProfile`) |
| `units` | `'metric' \| 'imperial'` | Display only; the profile is always stored in cm/kg |
| `showFat` | `boolean` | Fat layer visibility on the model |
| `onChange` | `(profile) => void` | Every slider change and "Reset to default body" |
| `onUnitsChange` | `(units) => void` | `cm·kg` / `ft·lb` radio group |
| `onShowFatChange` | `(show) => void` | "Layer" switch (`role="switch"`, labelled "Show fat layer on the model") |

## How it works

All numbers come from [profile.ts](../body-3d/profile.md):

- Sliders (local `Slider`): range inputs with `step 1`, `aria-valuetext` set to
  the formatted value, CSS vars `--fill` (current %) and `--mark` (default
  value tick). Limits from `PROFILE_LIMITS`. The body-fat slider uses
  `range-bands`: `BAND_TRACK` is a gradient with one colour per
  `BODY_FAT_BANDS` entry (`BAND_COLORS`), positioned over the 4-45% range.
- Stats: BMI (+ category, coloured), FFMI (+ category), lean mass, fat mass.
- Fat map: `fatSiteThickness(profile).sites` as bars on a fixed 0-60 mm scale
  (so they visibly grow), values `<1 mm` or rounded mm; plus litres under the
  skin and around the organs from `fatStores`.
- Range guide: the current `bodyFatBand` with its label (coloured by `tone`),
  range text (`< 6%`, `14–17%`, `32%+`), "looks" bullets and note
  (`aria-live="polite"`).
- "Reset to default body" appears only when the profile differs from
  `DEFAULT_PROFILE`.

## Depends on

[profile](../body-3d/profile.md), [ui](../../components/ui.md) (`Panel`),
`.range` / `.range-bands` in [index.css](../../index.css.md).

## Used by

[App](../../App.md) (only when WebGL is available).

## Tests

[BodyProfilePanel.test](BodyProfilePanel.test.md).

## Gotchas / TODO

- `BAND_COLORS` must have one entry per `BODY_FAT_BANDS` item; adding a band
  without a colour produces `undefined` in the gradient.
- Some colours are hard-coded Tailwind palette classes (`text-amber-300`,
  `text-sky-300`) and hex fat colours, so they do not follow the theme.
- 288 lines; close to the ~300-line guideline.
