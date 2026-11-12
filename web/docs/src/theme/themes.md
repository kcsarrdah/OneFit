# `src/theme/themes.ts`

## Purpose

The theme catalogue for the parts of the app that cannot read CSS variables
(the three.js scene), plus the header's daily motivation line.

## Public API

- `type ThemeId = 'iron' | 'volt' | 'steel' | 'hologram'`.
- `interface Theme { id, label, tagline, accent, accentDeep, sceneBg }`:
  `accent` drives selection, buttons, leader line and platform glow;
  `accentDeep` the emissive glow; `sceneBg` the 3D background and fog.
- `THEMES: Record<ThemeId, Theme>`, `THEME_LIST` (in declaration order: Iron,
  Volt, Steel, Hologram).

| Theme | Accent | Accent deep | Scene bg | Tagline |
|---|---|---|---|---|
| iron | `#ff6a1f` | `#8a2a05` | `#0b0908` | Forged in the weight room |
| volt | `#c8ff2e` | `#4a6b00` | `#070807` | High voltage training |
| steel | `#ff3d4a` | `#7a0d16` | `#080a10` | Built rep by rep |
| hologram | `#2ee6c5` | `#0d8f7c` | `#070a12` | Know every muscle |

- `MOTIVATION: string[]` (7 lines) and `motivationFor(date): string`: one line
  per calendar day.
- `isThemeId(v): v is ThemeId`: validator for [useStoredState](../hooks/useStoredState.md).

## How it works

`motivationFor` takes the local calendar date, converts it to a day-of-year
via `Date.UTC` (so DST and the time of day do not matter) and indexes
`MOTIVATION` modulo its length.

The page palette for each theme lives in [index.css](../index.css.md) under
`[data-theme=...]`; `App` sets that attribute and passes the `Theme` object to
[BodyViewer](../features/body-3d/BodyViewer.md), which uses it for the
background, fog, platform, materials ([bodyMaterials](../features/body-3d/bodyMaterials.md)
`paletteFor`) and joint handles.

## Depends on

none.

## Used by

[App](../App.md), [BodyViewer](../features/body-3d/BodyViewer.md) (type).

## Tests

[themes.test](themes.test.md).

## Gotchas / TODO

- **Bug (minor):** `isThemeId` uses `v in THEMES`, which is also true for
  inherited keys (`'toString'`, `'constructor'`, ...). A tampered
  `onefit:theme` value such as `"toString"` passes validation and
  `THEMES[themeId]` is then a function, so `theme.accent` is undefined.
  `Object.hasOwn(THEMES, v)` would fix it.
- Accent values are duplicated in `index.css`; keep both in sync.
- Day of year is computed from day 0 (Dec 31), so the index starts at 1 on
  Jan 1; it only affects which line shows first.
