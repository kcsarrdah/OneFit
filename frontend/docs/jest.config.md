# `jest.config.js`

## Purpose

Jest config for the app's unit tests.

## Public API

| Key | Value |
|---|---|
| `preset` | `react-native` |
| `setupFilesAfterEnv` | [`__tests__/setup.ts`](__tests__/setup.md) |
| `testPathIgnorePatterns` | `node_modules/`, `.expo/`, and `__tests__/setup.ts` itself |
| `collectCoverageFrom` | `hooks/`, `components/`, `features/` (`.ts`/`.tsx`, no `.d.ts`) |
| `moduleNameMapper` | `^@/(.*)$` to `<rootDir>/$1` (matches the `tsconfig` alias) |
| `transformIgnorePatterns` | transform `react-native`, `@react-native`, `expo`, `@expo`, `react-native-svg`, `react-native-reanimated`, `@react-native-async-storage`, `react-native-gesture-handler`, `@react-navigation` packages |
| `testEnvironment` | `node` |

## How it works

Every `*.test.ts` under `__tests__/` runs; the tree mirrors the source
(`__tests__/features/water/lib/hydration.test.ts` tests
`features/water/lib/hydration.ts`).

## Depends on

`jest` 29, the `react-native` Jest preset, [babel.config](babel.config.md).

## Used by

`npx jest`, `npm test`, `npm run test:watch`, `npm run test:coverage`.

## Tests

none.

## Gotchas / TODO

`testEnvironment: 'node'` plus the setup file's stub of `react-native`
(only `AppState` and `Platform`) means component rendering tests cannot run as
configured; see [setup](__tests__/setup.md).
