# `__tests__/setup.ts`

## Purpose

Jest setup run before every suite (`setupFilesAfterEnv` in
[jest.config](../jest.config.md)): matchers and global mocks.

## Public API

Side effects only:

| Mock | Effect |
|---|---|
| `@testing-library/jest-native/extend-expect` | jest-native matchers |
| `global.setInterval` / `clearInterval` | Replaced with `jest.fn()` (`setInterval` returns `12345`), so real intervals never run unless a test calls `jest.useFakeTimers()` |
| `@react-native-async-storage/async-storage` | The package's official in-memory Jest mock |
| `expo-notifications` | `scheduleNotificationAsync`, `requestPermissionsAsync` as `jest.fn()` |
| `react-native` | **Only** `AppState` (`currentState: 'active'`, `addEventListener` returning `{ remove }`) and `Platform` (`OS: 'ios'`, `select` returning `.ios`) |
| `react-native-reanimated` | `react-native-reanimated/mock` |

## How it works

Built for the fasting hook tests ([useFastingTimer.test](features/fasting/hooks/useFastingTimer.test.md)):
the interval stub keeps the timer hook from ticking, and the `AppState` stub
lets it subscribe.

## Depends on

`@testing-library/jest-native`, the AsyncStorage and Reanimated Jest mocks.

## Used by

Every suite.

## Tests

This is test setup.

## Gotchas / TODO

- **No component can be rendered under this setup**: the `react-native` mock
  has no `View`, `Text`, `StyleSheet`, etc. Component tests need a partial
  mock (`jest.requireActual('react-native')` plus overrides) or per-suite
  mocks.
- The global `setInterval` stub silently affects any code under test that
  uses intervals.
- `@testing-library/jest-native` is deprecated in favour of the matchers
  built into `@testing-library/react-native` 12.4+ (installed: 13).
