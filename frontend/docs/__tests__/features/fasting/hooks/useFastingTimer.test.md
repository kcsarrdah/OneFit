# `__tests__/features/fasting/hooks/useFastingTimer.test.ts`

## Purpose

Hook tests for [useFastingTimer](../../../../features/fasting/hooks/useFastingTimer.md)
with `renderHook`. 10 tests in `describe('useFastingTimer')`.

## Public API

| Test | Covers |
|---|---|
| should initialize with correct default state | Inactive, 0 elapsed, null start |
| should start fast and update state | `startFast` sets active and a start time |
| should call onComplete when stopping fast | `stopFast` passes start, end, actual and goal durations (mocked `Date.now`) |
| should reset timer state | `resetTimer` clears state |
| should not start if already active | Second `startFast` keeps the first start time |
| should calculate progress percentage correctly | 0% at rest for a 100 s goal |
| should increment elapsed seconds over time | Fake timers + mocked `Date.now`: 10 s, then 15 s |
| should continue running past goal duration without auto-stopping | Elapsed 40 s on a 30 s goal, still active, progress capped at 100, no `onComplete` |
| should save and restore timer state from storage | A stored start 5 s ago resumes; stopping removes `fastingTimerState` |
| should not break when stopping an inactive timer | No-op stop, then a normal start |

## How it works

Uses the AsyncStorage Jest mock (resolved per test), `jest.spyOn(Date, 'now')`
and, for ticking, `jest.useFakeTimers()` (which overrides the global interval
stub from [setup](../../../setup.md)).

## Depends on

`@testing-library/react-native` (`renderHook`, `act`), [setup](../../../setup.md).

## Used by

`npx jest`.

## Tests

This is a test file.

## Gotchas / TODO

- Not covered: restoring a fast whose goal has already passed (the hook
  deletes it; see the bug in [useFastingTimer](../../../../features/fasting/hooks/useFastingTimer.md)),
  a stored state with a different goal, the `AppState` foreground handler.
- Mocked `Date.now` spies are not restored between tests (only
  `clearAllMocks`); later tests see the last mocked value.
- Indentation of the last two tests is off (cosmetic).
