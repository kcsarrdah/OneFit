# `eslint.config.js`

## Purpose

ESLint flat config: Expo's recommended rules, ignoring `dist/`.

## Public API

`defineConfig([expoConfig, { ignores: ['dist/*'] }])`.

## How it works

`eslint-config-expo/flat` brings React, React Hooks (`exhaustive-deps`),
TypeScript (`no-unused-vars`, `array-type`, `no-redeclare`) and import rules.
All findings are warnings, so `eslint` exits 0 even with warnings.

## Depends on

`eslint` 9, `eslint-config-expo`.

## Used by

`npx eslint app components hooks constants contexts features` (the check in
`CLAUDE.md`) and `npm run lint` (`expo lint`).

## Tests

none.

## Gotchas / TODO

The last run reported 26 warnings, 0 errors; see
[tests/README](tests/README.md#last-run) for the list.
