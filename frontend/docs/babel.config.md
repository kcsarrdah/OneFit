# `babel.config.js`

## Purpose

Babel config for Metro and Jest.

## Public API

Exports `function (api)` returning presets `babel-preset-expo` and
`@babel/preset-typescript`, and the plugin `react-native-reanimated/plugin`.

## How it works

`api.cache(true)` caches the config for the process. The Reanimated plugin
compiles `'worklet'` functions and `useAnimatedStyle` callbacks for the UI
thread; it must stay the last plugin.

## Depends on

`babel-preset-expo`, `@babel/preset-typescript`, `react-native-reanimated`.

## Used by

Metro bundler, Jest (through the `react-native` preset's babel-jest).

## Tests

none (every suite is transformed with it).

## Gotchas / TODO

`babel-preset-expo` already handles TypeScript; the extra
`@babel/preset-typescript` is redundant but harmless.
