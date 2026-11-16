# `__tests__/features/water/hooks/useHydration.test.ts`

## Purpose

Hook tests for [useHydration](../../../../features/water/hooks/useHydration.md)
with `renderHook` and the AsyncStorage Jest mock. 4 tests.

## Public API

| Test | Covers |
|---|---|
| restores today's intake | A stored intake for today's local day loads |
| starts from 0 when the stored intake is from another day | Old `intakeDate` resets to 0 |
| marks the day keys as migrated | `aquaViz_dayKeys` is `'local'` after the first load |
| starts a new day when logging after midnight with the app still open | Two logs at 23:50, one at 00:10: intake 250, `intakeDate` the new day, both days' history entries kept (500 and 250) |

## How it works

`AsyncStorage.clear()` before each test; a short real `setTimeout` lets the
async load and saves settle. The midnight test uses modern fake timers with
`setTimeout`/`setInterval` left real (the [setup](../../../setup.md) stubs
the intervals) and moves the clock with `jest.setSystemTime`; local-time
`Date` constructors keep it time-zone independent.

## Depends on

`@testing-library/react-native` (`renderHook`, `act`), [setup](../../../setup.md).

## Used by

`npx jest`.

## Tests

This is a test file.

## Gotchas / TODO

Not covered: the `AppState` foreground rollover (the setup's `AppState` mock
never fires), the UTC-to-local migration through the hook (covered as a pure
function in [hydration.test](../lib/hydration.test.md)), and the
[Reset dialog](../../../../features/water/components/HydrationActions.md).
