# `constants/Colors.ts`

## Purpose

All app colours: the dark-only "iron" palette, the water blues, and the
liquid glass colours and geometry.

## Public API

| Export | What |
|---|---|
| `Colors` | `{ light: iron, dark: iron }`. Both schemes are iron, so code that still asks for `'light'` stays dark |
| `WaterColors` | Water blues (`primary #1E88E5`, `secondary`, `light`, `surface`, `drop`) and progress steps (`empty`, `low` orange, `medium`, `high #1976D2`, `full`) |
| `GlassmorphismColors` | `{ dark }` only (the app is dark only): glass `background` (70% fill), `overlay`, `border` (8% white), `shadow`, `iconActive/Inactive/Muted` |
| `GlassEffectConfig` | Glass geometry: `borderRadius.vertical/horizontal` and `shadow` per platform, `dimensions.vertical` (`width` 60, `contentInset` 84: the left padding every screen uses to clear the sidebar, `tabHeight` 64), `dimensions.horizontal` (`height`, `margin` 40) |
| `getWaterProgressColor(percentage, colorScheme)` | `WaterColors` step for a percentage (>=100 full, >=75 high, >=50 medium, >=25 low, else empty) |

Iron tokens (`Colors.dark`):

| Token | Value | Use |
|---|---|---|
| `background` | `#0b0908` | Screens (warm near-black) |
| `foreground`, `text`, `primary`, `cardForeground` | `#f3ece4` | Chalk text |
| `card`, `popover` | `#1d1916` | Raised surfaces |
| `secondary`, `muted`, `border` | `#2a241f` | Chips, dividers |
| `input` | `#3a322b` | Field borders, pressed |
| `mutedForeground`, `icon` | `#b8ada2` | Secondary text |
| `tabIconDefault` | `#8a7f74` | Placeholders, dim text |
| `accent`, `tint`, `ring`, `tabIconSelected`, `chart1` | `#ff6a1f` | The one action colour |
| `accentGradientEnd` | `#ff8a4a` | Fasting ring gradient end |
| `accentForeground`, `primaryForeground` | `#0b0908` | Ink on accent / chalk |
| `destructive` / `destructiveForeground` | `#e5484d` / `#fff7f5` | |
| `overlay` | `rgba(0,0,0,0.7)` | Dialog backdrop |
| `chart2..5` | `#ffc23d`, `#5fb4ff`, `#c8ff2e`, `#e5484d` | |
| `waterPrimary`...`waterDrop` | from `WaterColors` | |

## How it works

Plain objects. `GlassEffectConfig` reads `Platform.OS` at import time.

## Depends on

`react-native` `Platform`.

## Used by

Nearly every component and screen (directly as `Colors.dark`, or via
[useThemeColor](../hooks/useThemeColor.md)); `app/_layout.tsx` builds the
navigation theme from it.

## Tests

none.

## Gotchas / TODO

- The header comment still says colours are "defined in the light and dark
  mode"; they are not, by design (`CLAUDE.md` rule 4: dark only).
- `getWaterProgressColor` is unused;
  `getWaterProgressColor`'s `colorScheme` argument is ignored.
- The water blues are outside the iron palette on purpose (the Water screen).
- Iron matches the web app's default theme (`web/src/index.css`); keep the
  two in step when either changes.
