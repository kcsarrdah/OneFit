# `constants/Fonts.ts`

## Purpose

Font family names. Oswald is the display voice (headings, big numbers,
action labels); body text stays in the platform sans.

## Public API

`Fonts = { display: 'Oswald_600SemiBold', displayBold: 'Oswald_700Bold' } as const`.

## How it works

The names must match the keys passed to `useFonts` in
[app/_layout](../app/_layout.md), which loads them from
`@expo-google-fonts/oswald`.

## Depends on

nothing.

## Used by

[SwipeToConfirm](../components/ui/SwipeToConfirm.md), [BigNumber](../components/ui/BigNumber.md),
[PickNext](../features/workouts/components/PickNext.md), [SetLogger](../features/workouts/components/SetLogger.md).

## Tests

none.

## Gotchas / TODO

Older screens (Fasting, Water, Routines, History) still use bold system text
for headings and numbers instead of Oswald.
