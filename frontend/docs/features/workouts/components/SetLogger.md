# `features/workouts/components/SetLogger.tsx`

## Purpose

Logs one exercise's sets, Robinhood style. Two huge numbers start from this
exercise's own last set; steppers nudge them; the accent sheet at the bottom
is swiped up to log. The sheet fills the screen and the rest screen carries on
in that colour. "Set N" lowers the colour back into the bar, numbers kept.

## Public API

`SetLogger(props)`:

| Prop | Type | Meaning |
|---|---|---|
| `exercise` | `Exercise` | |
| `today` | `WorkoutSet[]` | Completed sets for it in this workout |
| `last` | `LastPerformance \| null` | Last time's sets |
| `unit` | `WeightUnit` | |
| `onLog` | `(weight, reps) => void` | |
| `onUndo` | `() => void` | Remove the set just logged |
| `onBack` | `() => void` | Back to "What's next?" |
| `restSeconds` | `number` = 120 | Rest countdown |

Internal (not exported): `EntryScreen`, `RestScreen`.

## How it works

- State: `numbers` (`{ weight, reps }`, from [startingSet](../lib/setLogging.md)
  on mount), `phase` (`'enter' | 'returning' | 'resting'`), `restStartedAt`.
- `enter` / `returning`: [SwipeToConfirm](../../../components/ui/SwipeToConfirm.md)
  ("Swipe up to log", `enterFromFull` when returning) around `EntryScreen`:
  back chevron, "Set N", the exercise name (tap = back), a line with today's
  sets, or last time's (`Yesterday: 80 × 8, ...`), or "First time logging
  this one"; two [BigNumber](../../../components/ui/BigNumber.md)s (weight with
  caption `KG`, `KG EACH` for dumbbells, max 500 kg / 1100 lbs; reps, max 200,
  at least 1) and two [Stepper](../../../components/ui/Stepper.md)s
  ([weightStep](../lib/setLogging.md), 1 rep).
- Confirm: `onLog(weight, reps)`, record the time, `phase = 'resting'`.
- `RestScreen`, full screen in the accent colour with near-black ink
  (7.6:1): "SET N LOGGED", the weight × reps, a big Oswald countdown
  (`m:ss`, ticks every 250 ms) with a draining bar, chips of today's sets,
  and two buttons: "Next exercise" (`onBack`) and "Set N+1"
  (`phase = 'returning'`). "Undo" in the header calls `onUndo` and returns.
  A warning haptic fires when the countdown reaches 0, and the label turns
  from "Rest" to "Go".

## Depends on

[SwipeToConfirm](../../../components/ui/SwipeToConfirm.md), [BigNumber](../../../components/ui/BigNumber.md),
[Stepper](../../../components/ui/Stepper.md), [Button](../../../components/ui/Button.md),
[IconSymbol](../../../components/ui/IconSymbol.md), [setLogging](../lib/setLogging.md),
[Colors](../../../constants/Colors.md), [Fonts](../../../constants/Fonts.md), `expo-haptics`.

## Used by

[WorkoutScreen](../screens/WorkoutScreen.md) (keyed by session entry id).

## Tests

none.

## Gotchas / TODO

- 341 lines, over the ~300 guideline in `CLAUDE.md`; `EntryScreen` and
  `RestScreen` could move to their own files.
- The rest interval keeps ticking every 250 ms after reaching 0 until the
  screen is left.
- The rest timer is not persisted and does not notify in the background
  (`expo-notifications` is installed but unused).
- After Undo the numbers stay as typed, not reset to the previous set.
