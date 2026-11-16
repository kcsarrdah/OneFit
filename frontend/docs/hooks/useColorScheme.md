# `hooks/useColorScheme.ts`

## Purpose

The colour scheme for native builds: from [ThemeContext](../contexts/ThemeContext.md),
so always `'dark'`.

## Public API

`useColorScheme(): 'light' | 'dark'`.

## How it works

`useTheme().colorScheme`. Web uses [useColorScheme.web](useColorScheme.web.md).

## Depends on

[ThemeContext](../contexts/ThemeContext.md).

## Used by

[useThemeColor](useThemeColor.md) and many components that index
`Colors[colorScheme ?? 'light']`.

## Tests

none.

## Gotchas / TODO

Must be called inside `ThemeProvider`, or it throws.
