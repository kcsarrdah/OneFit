# `hooks/useColorScheme.web.ts`

## Purpose

Web build of [useColorScheme](useColorScheme.md) (Expo template): returns
`'light'` until hydrated, then the browser's scheme, for static rendering.

## Public API

`useColorScheme(): 'light' | 'dark' | null | undefined`.

## How it works

A `hasHydrated` flag set in an effect; before it, `'light'`; after,
React Native's `useColorScheme()` (the OS/browser preference).

## Depends on

`react-native`.

## Used by

Same callers as `useColorScheme`, on web.

## Tests

none.

## Gotchas / TODO

It ignores [ThemeContext](../contexts/ThemeContext.md), unlike the native
hook. Harmless today because `Colors.light` and `Colors.dark` are both iron,
but `GlassmorphismColors` differs per scheme: on web with a light OS
preference the tab bar and sidebar use the light glass (white 70% fill with
dark icons). Make this return `'dark'` too.
