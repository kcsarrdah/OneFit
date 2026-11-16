# `src/features/body-3d/profile.ts`

## Purpose

The body profile maths: turns height, weight, body fat and age into body
composition, fat stores, per-site fat thickness, and the `BodyShape` the 3D
figure is reshaped by. No three.js, so the page can import it without the 3D
chunk.

## Public API

Types: `BodyProfile { heightCm, weightKg, age, bodyFatPct }`, `BodyShape`,
`FatSite { label, factor }`, `BodyFatBand { label, from, looks[], note, tone }`,
`BmiCategory`, `FfmiCategory`, `Units = 'metric' | 'imperial'`.

| Export | Returns |
|---|---|
| `PROFILE_LIMITS` | height 140-210 cm, weight 40-160 kg, age 16-90, body fat 4-45% |
| `DEFAULT_PROFILE` | `{ heightCm: 171, weightKg: 70, age: 30, bodyFatPct: 15 }` (the source model) |
| `composition(p)` | `{ fatKg, leanKg, ffmi }` |
| `bmi(p)`, `bmiCategory(bmi)` | kg/m²; < 18.5 / < 25 / < 30 / else |
| `fatStores(p)` | `{ essentialKg, subcutaneousL, visceralL }` |
| `bodySurfaceArea(p)` | m² (Du Bois) |
| `FAT_SITES` | 8 sites with relative thickness factors |
| `fatSiteThickness(p)` | `{ meanMm, sites: (FatSite & { mm })[] }` |
| `bodyShape(p)` | `BodyShape` (below) |
| `clampProfile(partial)` | Full, rounded, clamped `BodyProfile` |
| `BODY_FAT_BANDS`, `bodyFatBand(pct)` | 7 male appearance bands: Stage lean (0), Shredded (6), Athletic (10), Fit (14), Average (18), Above average (25), High (32) |
| `ffmiCategory(ffmi)` | < 18 Below average, < 20 Average, < 22 Athletic, < 24 Very muscular, else Elite |
| `formatHeight(cm, units)`, `formatWeight(kg, units)` | `"180 cm"` / `5′ 11″`, `"70 kg"` / `"154 lb"` |

`BodyShape` fields:

| Field | Meaning | Formula |
|---|---|---|
| `scaleY` | Vertical scale from the feet | `heightCm / 171` |
| `scaleXZ` | Horizontal scale | `1 + (scaleY - 1) × 0.35` (taller is a bit broader, not proportionally) |
| `inflate` | Metres along each muscle's normal (lean mass only) | `0.008 × tanh((ffmi - ffmiModel) × 0.0016 / 0.008) - ageing × 0.0025` |
| `subcutaneousL`, `visceralL` | Fat volumes for the fat layer | from `fatStores` |
| `spineBend` | Forward stoop, radians | `ageing × 11°` |
| `desaturate` | Muscle colour loss 0..1 | `ageing × 0.35` |

where `ageing = smoothstep(45, 88, age)` and `ffmiModel` is the FFMI of
`DEFAULT_PROFILE` (≈ 20.9).

## How it works

**Composition.** `fatKg = weight × bf%`, `leanKg = weight - fatKg`. FFMI is
lean mass over height² normalised to 1.8 m (Kouri et al. 1995):
`lean / h² + 6.1 × (1.8 - h)`.

**Fat stores.** Essential fat (organs, marrow) is 3% of body weight (male
value), capped at total fat. The rest is stored adipose tissue: a visceral
share of `0.08 + 0.10 × smoothstep(12, 35, bf%)` (8% when lean, rising to 18%),
the remainder subcutaneous. Kilograms become litres of adipose tissue at
1.3 L/kg (tissue is ~80% lipid at ~0.92 kg/L).

**Site thickness.** Litres per m² are millimetres, so the mean subcutaneous
thickness is `subcutaneousL / BSA`. Each site multiplies that by its factor
(Belly 3.2, Love handles 2.6, Lower back 1.95, Chest 1.55, Under the chin 1.55,
Thighs 1.1, Back of the arms 1.05, Calves & forearms 0.4).

Worked examples (171 cm, 30 y):

| Weight, bf% | Fat / lean kg | FFMI | Subcut. L | Visceral L | Mean mm | `inflate` |
|---|---|---|---|---|---|---|
| 70 kg, 15% (default) | 10.5 / 59.5 | 20.9 | 10.0 | 0.92 | 5.5 | 0 mm |
| 70 kg, 8% | 5.6 / 64.4 | 22.6 | 4.2 | 0.36 | 2.3 | +2.6 mm |
| 70 kg, 30% | 21.0 / 49.0 | 17.3 | 20.5 | 4.12 | 11.3 | -4.9 mm |
| 90 kg, 12% | 10.8 / 79.2 | 27.6 | 9.7 | 0.84 | 4.8 | +7.0 mm |

**Shape.** Muscle size depends only on lean mass (via FFMI); fat never inflates
the muscles. It is drawn as a separate layer whose volume is
`subcutaneousL`/`visceralL` (see [BodyModel](BodyModel.md) and
[bodyMaterials](bodyMaterials.md)). `inflate` saturates softly at ±8 mm
because thin shells (forearms, calves) split apart beyond that.

**clampProfile** merges `DEFAULT_PROFILE` under the input first, so saved
profiles from before `bodyFatPct` existed still load.

## Depends on

none.

## Used by

[App](../../App.md) (`bodyShape`, `clampProfile`, limits),
[BodyProfilePanel](../profile/BodyProfilePanel.md) (everything displayed),
[BodyModel](BodyModel.md) / [BodyViewer](BodyViewer.md) (`BodyShape` type).

## Tests

[profile.test](profile.test.md).

## Gotchas / TODO

- `FAT_SITES` factors are said to "match the weights baked into the 3D fat
  layer", but they are hand-set constants; nothing checks them against
  `fatWeight` in [fatLayer.mjs](../../../scripts/lib/fatLayer.md). Changing one
  side silently desynchronises the panel and the figure.
- Male-only model: essential fat (3%), bands and distribution. The UI says
  women's ranges are ~8-10 points higher but there is no sex input.
- At a fixed weight, raising body fat lowers lean mass, so the muscles shrink
  (negative `inflate`) while the fat layer grows. That is intended, but can
  surprise.
