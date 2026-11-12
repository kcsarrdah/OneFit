# `src/theme/themes.test.ts`

## Purpose

Unit tests for [themes.ts](themes.md).

## Public API

| Block / test | Covers |
|---|---|
| `themes` › defines valid hex colours for the 3D scene | Every theme's `accent`, `accentDeep`, `sceneBg` is `#rrggbb`; `THEMES[id]` is the same object as in `THEME_LIST` |
| `themes` › validates stored theme ids | `isThemeId('iron')` true; `'light'` and `42` false |
| `motivationFor` › is stable within a day and changes between days | Same line at 07:00 and 23:00, different line the next day, line comes from `MOTIVATION` |

## How it works

Pure functions; no DOM.

## Depends on

Vitest.

## Used by

`npm test`.

## Tests

This is a test file.

## Gotchas / TODO

Not covered: inherited-key ids such as `'toString'` (which `isThemeId`
wrongly accepts), and agreement between these colours and the
`[data-theme]` blocks in [index.css](../index.css.md).
