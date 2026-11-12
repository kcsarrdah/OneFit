# `app/(tabs)/index.tsx`

## Purpose

The Home tab. Still the Expo starter's welcome screen.

## Public API

Default export `HomeScreen`: a [ParallaxScrollView](../../components/ParallaxScrollView.md)
with the partial React logo header, "Welcome!" plus [HelloWave](../../components/HelloWave.md),
and three template steps.

## How it works

Template content only, in [ThemedText](../../components/ThemedText.md) /
[ThemedView](../../components/ThemedView.md).

## Depends on

`ParallaxScrollView`, `HelloWave`, `ThemedText`, `ThemedView`, `expo-image`,
`assets/images/partial-react-logo.png`.

## Used by

expo-router (`/`, first tab).

## Tests

none.

## Gotchas / TODO

- Placeholder until a dashboard exists (the sidebar already lists Overview,
  Goals, Streaks for this mode).
- The "Hello World." step repeats the same `reset-project` sentence three
  times (copy-paste in the JSX).
- Not a one-line re-export of a feature screen, unlike the feature tabs.
