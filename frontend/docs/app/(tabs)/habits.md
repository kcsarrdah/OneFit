# `app/(tabs)/habits.tsx`

## Purpose

The Habits tab: a placeholder.

## Public API

Default export `HabitsScreen`: centred "Habits" title and "Test tab for
scrolling".

## How it works

[ThemedView](../../components/ThemedView.md) + [ThemedText](../../components/ThemedText.md).

## Depends on

`ThemedText`, `ThemedView`.

## Used by

expo-router (`/habits`).

## Tests

none.

## Gotchas / TODO

When habits are built, move the screen to `features/habits/screens/` and
make this a one-line re-export like the other feature tabs.
