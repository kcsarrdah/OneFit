# `components/HelloWave.tsx`

## Purpose

Expo template: a waving-hand emoji that rocks four times on mount.

## Public API

`HelloWave()`.

## How it works

A Reanimated shared value rotates 0 to 25 degrees and back
(`withRepeat(withSequence(...), 4)`), 150 ms each way.

## Depends on

`react-native-reanimated`, [ThemedText](ThemedText.md).

## Used by

[app/(tabs)/index](../app/(tabs)/index.md).

## Tests

none.

## Gotchas / TODO

Template leftover. Ignores Reduce Motion.
