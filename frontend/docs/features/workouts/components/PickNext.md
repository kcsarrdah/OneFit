# `features/workouts/components/PickNext.tsx`

## Purpose

"What's next?": the exercises for a muscle group, most recent first, each
with its own last numbers. Picking one opens the set logger. There is no plan
to edit; a different exercise is just a different tap.

## Public API

| Prop | Type | Meaning |
|---|---|---|
| `options` | `NextOption[]` | From [nextOptions](../lib/setLogging.md) |
| `muscleGroup` | `string \| null` | Selected chip (null = All) |
| `onMuscleGroup` | `(g: string \| null) => void` | |
| `query` / `onQuery` | `string` / setter | Search text |
| `onPick` | `(exercise) => void` | Row tap |
| `setsLogged` | `number` | Completed sets this workout |
| `onFinish` | `() => void` | Finish button |

## How it works

- Scrolling content, left padding `GlassEffectConfig...contentInset` to clear
  the floating sidebar: Oswald title "WHAT'S NEXT?", a chip row (All + six
  groups; tapping one clears the search), then one row per option.
- Row: name, and either `Last: 80 × 8 · yesterday` (first set of last time,
  [formatSets](../lib/setLogging.md) / [relativeDay](../lib/setLogging.md)) or
  `New · <equipment>`; on the right, "N SETS TODAY" in accent or a chevron.
- While searching, no chip shows as selected; an empty result says
  `No exercise matches "<query>"`.
- A fixed footer above the tab bar (`insets.bottom + 96`): the pill search
  [Input](../../../components/ui/Input.md) and, once a set is logged,
  "N sets this workout" with an accent ghost "FINISH" button.

## Depends on

[setLogging](../lib/setLogging.md), [constants](../constants.md), [types](../types.md),
[Button](../../../components/ui/Button.md), [Input](../../../components/ui/Input.md),
[IconSymbol](../../../components/ui/IconSymbol.md), [Colors](../../../constants/Colors.md),
[Fonts](../../../constants/Fonts.md).

## Used by

[WorkoutScreen](../screens/WorkoutScreen.md).

## Tests

none.

## Gotchas / TODO

- `SIDEBAR_INSET` is a stop-gap ("until navigation is reworked").
- The footer's `insets.bottom + 96` and the list's `+ 160` are tuned to the
  tab bar height by hand.
