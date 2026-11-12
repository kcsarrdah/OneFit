# `components/ThemedText.tsx`

## Purpose

Expo template `Text` that takes its colour from the theme, with five preset
types.

## Public API

`ThemedText(props: ThemedTextProps)`;
`ThemedTextProps = TextProps & { lightColor?, darkColor?, type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' }`.

| `type` | Style |
|---|---|
| `default` | 16 / line 24 |
| `defaultSemiBold` | 16 / line 24, 600 |
| `title` | 32 / line 32, bold |
| `subtitle` | 20, bold |
| `link` | 16 / line 30, `#0a7ea4` |

## How it works

Colour from [useThemeColor](../hooks/useThemeColor.md)`(..., 'text')` (iron
chalk `#f3ece4`); the caller's `style` wins.

## Depends on

[useThemeColor](../hooks/useThemeColor.md).

## Used by

Most workout components and screens, `CenteredMessage`, `StatColumn`,
`NutritionScreen`, the template tabs, `+not-found`, `Collapsible`, `HelloWave`.

## Tests

none.

## Gotchas / TODO

- `type="default"` sets `lineHeight: 24`; a caller that only raises `fontSize`
  (e.g. 24) can get clipped text.
- The `link` blue is not an iron colour.
- Newer screens (PickNext, SetLogger, Fasting, Water) use plain `Text` with
  `Colors.dark`; both styles coexist.
