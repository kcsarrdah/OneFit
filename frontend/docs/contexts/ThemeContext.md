# `contexts/ThemeContext.tsx`

## Purpose

Theme preference context. The app is dark only: the preference is stored but
never applied.

## Public API

`ThemeProvider({ children })` and `useTheme()` (throws outside the provider),
returning `{ colorScheme: 'dark', themePreference: 'light' | 'dark' | 'system', setThemePreference(p), toggleTheme() }`.

## How it works

`colorScheme` is hard-coded to `'dark'`. The preference loads from
AsyncStorage key `theme-preference` on mount and is saved by
`setThemePreference`. `toggleTheme` stores `'light'` (since the scheme is
always dark), which changes nothing visible.

## Depends on

`@react-native-async-storage/async-storage`.

## Used by

[app/_layout](../app/_layout.md) (provider), [useColorScheme](../hooks/useColorScheme.md).

## Tests

none.

## Gotchas / TODO

Kept "for later" per the code comment. `setThemePreference` and
`toggleTheme` have no callers. If a light theme is ever added, `Colors.light`
must stop aliasing iron as well.
