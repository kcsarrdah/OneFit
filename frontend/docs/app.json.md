# `app.json`

## Purpose

Expo app config: name, icons, splash, platforms and plugins.

## Public API

| Key | Value | Notes |
|---|---|---|
| `name` / `slug` / `scheme` | `frontend` | Still the template names; the deep-link scheme is `frontend://` |
| `orientation` | `portrait` | |
| `userInterfaceStyle` | `dark` | The app is dark only (see [Colors](constants/Colors.md)) |
| `newArchEnabled` | `true` | React Native New Architecture |
| `ios.supportsTablet` | `true` | |
| `android.adaptiveIcon` | `assets/images/adaptive-icon.png` on `#ffffff` | |
| `android.edgeToEdgeEnabled` | `true` | |
| `web` | `bundler: metro`, `output: static`, favicon | Static rendering, see [useColorScheme.web](hooks/useColorScheme.web.md) |
| `plugins` | `expo-router`; `expo-splash-screen` (`splash-icon.png`, 200 wide, `#ffffff`) | |
| `experiments.typedRoutes` | `true` | Typed `href`s, generated into `.expo/types` |

## How it works

Read by the Expo CLI at build and start time. `package.json` sets
`"main": "expo-router/entry"`, so routes come from `app/`.

## Depends on

`expo`, `expo-router`, `expo-splash-screen`, images in `assets/images/`.

## Used by

`npx expo start`, EAS/prebuild.

## Tests

none.

## Gotchas / TODO

- Name, slug and scheme are still `frontend`, not `OneFit`.
- Splash and Android icon backgrounds are white (`#ffffff`), which flashes
  against the dark iron theme. `#0b0908` would match.
