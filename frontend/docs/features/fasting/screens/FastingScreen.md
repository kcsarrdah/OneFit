# `features/fasting/screens/FastingScreen.tsx`

## Purpose

The fasting timer: one big number for the time left, when the fast started
and when it ends, and one action at the thumb (Start fast, then End fast). A
finished fast takes over the screen in the accent to save or discard it.

## Public API

`FastingScreen()`, re-exported by [app/(tabs)/fasting](../../../app/(tabs)/fasting.md).

## How it works

- Schedule is fixed to `FASTING_SCHEDULES[0]` (16:8, goal 57,600 s).
- [useFastingTimer](../hooks/useFastingTimer.md) with
  `onComplete: completion.openModal` from [useFastCompletion](../hooks/useFastCompletion.md).
- [ScreenTitle](../../../components/ui/ScreenTitle.md) "Fasting", "16:8 · 16
  hours fasting", then [FastRing](../components/FastRing.md): idle shows the
  goal ("16:00", "hours to go"); active shows the time **left**
  (`formatHoursClock(remainingSeconds)`) with "left · N%".
- Start / Ends in Oswald via `formatDayTime`. Idle: "Now" and when the fast
  would end if started now; active: the real start and end.
- An [ActionButton](../../../components/ui/ActionButton.md): "Start fast", or
  "End fast". Ending before the goal opens a [ConfirmDialog](../../../components/ui/ConfirmDialog.md)
  ("End your fast? 7h 42m to go of 16h…"); at or past the goal it ends
  straight away.
- When the completion hook has a finished fast, [FastComplete](../components/FastComplete.md)
  covers the screen and the screen sets focus mode (header, sidebar and tab
  bar hide); focus mode is cleared when it closes or the screen unmounts.
- Content is inset by `GlassEffectConfig.dimensions.vertical.contentInset`.

## Depends on

[useFastingTimer](../hooks/useFastingTimer.md), [useFastCompletion](../hooks/useFastCompletion.md),
[FastRing](../components/FastRing.md), [FastComplete](../components/FastComplete.md),
[constants](../constants.md), [format](../lib/format.md), [ActionButton](../../../components/ui/ActionButton.md),
[ConfirmDialog](../../../components/ui/ConfirmDialog.md), [ScreenTitle](../../../components/ui/ScreenTitle.md),
[NavigationContext](../../../contexts/NavigationContext.md), [Colors](../../../constants/Colors.md),
[Fonts](../../../constants/Fonts.md).

## Used by

[app/(tabs)/fasting](../../../app/(tabs)/fasting.md).

## Tests

none (hooks and format are tested).

## Gotchas / TODO

- The sidebar's Schedules / Progress / Tips do nothing; there is no schedule
  picker.
- Idle "Ends" is computed at render, so it only moves when the screen
  re-renders (not every minute).
- There is no Reset any more: before a fast there is nothing to reset, and
  a finished fast is discarded from the takeover. `resetTimer` in the hook is
  unused by the UI.
