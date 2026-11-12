# `features/workouts/screens/WorkoutScreen.tsx`

## Purpose

The swipe-to-log screen. "What's next?" ([PickNext](../components/PickNext.md))
lists exercises for a muscle group; picking one opens the full-screen
[SetLogger](../components/SetLogger.md) for it.

## Public API

`WorkoutScreen({ session: ReturnType<typeof useWorkoutSession> })`.

## How it works

- State: `muscleGroup` (starts at `'Chest'`), search `query`, `activeId`
  (session entry being logged).
- `options` = [nextOptions](../lib/setLogging.md) over `EXERCISES` (filtered by
  name when searching, which also ignores the muscle group), saved history and
  the session.
- Pick: `setActiveId(session.startExercise(exercise))`.
- While `active` is set: `setFocusMode(true)` (header, sidebar and tab bar
  hide; reset on unmount) and render `SetLogger` keyed by the entry id, with
  that entry's completed sets as `today` and
  [lastPerformance](../lib/setLogging.md) from history. `onLog` / `onUndo` call
  `logSet` / `removeLastSet`; `onBack` clears `activeId`.
- Finish: [completedOnly](../lib/setLogging.md) of the session; if anything was
  logged, save it with duration `now - startTime` and the weight unit, then
  `resetSession()`.

## Depends on

[PickNext](../components/PickNext.md), [SetLogger](../components/SetLogger.md),
[useWorkoutHistory](../hooks/useWorkoutHistory.md), [useWeightUnit](../hooks/useWeightUnit.md),
[useWorkoutSession](../hooks/useWorkoutSession.md) (type), [session](../lib/session.md),
[setLogging](../lib/setLogging.md), [constants](../constants.md), [NavigationContext](../../../contexts/NavigationContext.md).

## Used by

[WorkoutsTab](WorkoutsTab.md).

## Tests

none (logic tested via [setLogging.test](../../../__tests__/features/workouts/lib/setLogging.test.md)
and [session.test](../../../__tests__/features/workouts/lib/session.test.md)).

## Gotchas / TODO

- Finish has no confirmation and no feedback beyond the list resetting; a
  failed save is only logged to the console.
- The saved duration inherits the `startTime` problem described in
  [useWorkoutSession](../hooks/useWorkoutSession.md).
- `activeId` is not persisted: after an app restart you land on the list,
  not back in the logger.
