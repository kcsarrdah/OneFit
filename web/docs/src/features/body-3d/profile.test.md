# `src/features/body-3d/profile.test.ts`

## Purpose

Unit tests for the body profile maths in [profile.ts](profile.md).

## Public API

| Block › test | Covers |
|---|---|
| `bmi` › computes BMI and its category | 180 cm / 81 kg ≈ 25; one value per category |
| `bodyShape` › leaves the default profile almost unchanged | scale 1, `|inflate|` < 2 mm, no stoop |
| `bodyShape` › scales with height, but less in width than in height | 200 cm: `scaleY` > 1.15, `1 < scaleXZ < scaleY` |
| `bodyShape` › adds muscle size with lean mass, within limits | 100 kg at 15%: `inflate` 5-8 mm; 50 kg: negative |
| `bodyShape` › keeps fat separate from muscle | 64 kg lean either way (70 kg at 8.57% vs 90 kg at 28.9%): equal `inflate`, > 4× subcutaneous litres, more visceral |
| `bodyShape` › bends posture and fades muscle tone with age | 85 y: `spineBend` > 0.1 rad, `desaturate` > 0.25; 40 y: no stoop |
| `clampProfile` › rounds and clamps to supported ranges | Out-of-range and fractional input |
| `clampProfile` › fills in fields missing from older saved profiles | Missing `bodyFatPct` takes the default |
| `body composition` › splits weight into lean and fat mass | 80 kg at 20%: 16 / 64 kg |
| `body composition` › computes a normalised FFMI | 180 cm / 81 kg / 10% ≈ 22.5; categories |
| `body composition` › describes every body fat level with an ordered band | Bands ascending; one sample per band |
| `fat stores` › keeps essential fat out of storage and accounts for all fat | Essential 2.4 kg at 80 kg; litres / 1.3 + essential = total fat; nothing stored at 3% |
| `fat stores` › stores a growing share as visceral fat | Visceral share at 35% > at 10% |
| `fat stores` › estimates realistic thickness by site | BSA ≈ 2.0 m² at 180/80; mean 3-8 mm; belly > 5 × calves |
| `formatting` › formats height and weight in both unit systems | `180 cm`, `5′ 11″`, `70 kg`, `154 lb` |

## How it works

Pure functions; no DOM.

## Depends on

Vitest.

## Used by

`npm test`.

## Tests

This is a test file.

## Gotchas / TODO

Not covered: `bmiCategory` boundaries exactly (18.5, 25, 30), `inflate`
saturation at the extremes of the sliders, `fatSiteThickness` agreement with the
3D fat layer's weights (see the gotcha in [profile.md](profile.md)).
