# `features/fasting/screens/FastingScreen.tsx`

## Purpose

FastTrack: the current fast's progress ring, start and expected end, and
Start / Complete / Reset. Completing opens the "Fast complete" dialog.

## Public API

`FastingScreen()`, re-exported by [app/(tabs)/fasting](../../../app/(tabs)/fasting.md).

## How it works

- Schedule is fixed to `FASTING_SCHEDULES[0]` (16:8, goal 57,600 s).
- [useFastingTimer](../hooks/useFastingTimer.md) with
  `onComplete: completion.openModal` from [useFastCompletion](../hooks/useFastCompletion.md).
- One card: title ("Active Fast" / "Current Fast"), "16:8 - 16 hours", a
  240 px [CircularProgress](../components/CircularProgress.md) (label "Time
  Elapsed" / "Ready to Start", time remaining, or the full goal when idle),
  Start Time and Expected End ([formatClock](../lib/format.md)), and while
  active "HH:MM:SS elapsed • N% complete".
- Main button: accent "Start Fast" (play) or destructive "Complete Fast"
  (stop). "Reset" (outline) is disabled during a fast.
- [FastCompleteDialog](../components/FastCompleteDialog.md) is wired to the
  completion hook.

## Depends on

[useFastingTimer](../hooks/useFastingTimer.md), [useFastCompletion](../hooks/useFastCompletion.md),
[CircularProgress](../components/CircularProgress.md), [FastCompleteDialog](../components/FastCompleteDialog.md),
[constants](../constants.md), [format](../lib/format.md), [Button](../../../components/ui/Button.md),
[Card](../../../components/ui/Card.md), [IconSymbol](../../../components/ui/IconSymbol.md),
[Colors](../../../constants/Colors.md).

## Used by

[app/(tabs)/fasting](../../../app/(tabs)/fasting.md).

## Tests

none (hooks and format are tested).

## Gotchas / TODO

- The sidebar's Schedules / Progress / Tips do nothing; there is no schedule
  picker.
- The "Complete Fast" label and icon use `accentForeground` (near-black) on
  the destructive red.
- After completing, Start Time and the ring keep the last fast's values until
  Reset or the next Start.
- No sidebar inset; headings use system bold, not Oswald.
