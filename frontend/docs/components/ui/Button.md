# `components/ui/Button.tsx`

## Purpose

The shared button, ported from a shadcn-style web API: variants, sizes and a
spring press-scale.

## Public API

`Button` (forwardRef to `TouchableOpacity`), `ButtonProps`:

| Prop | Type | Meaning |
|---|---|---|
| `variant` | `'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link'` | Colours (below) |
| `size` | `'default' \| 'sm' \| 'lg' \| 'icon'` | Height 40 / 36 / 44 / 40x40 |
| `asChild` | `boolean` | Render `<View>{children}</View>` with no button at all |
| `children` | `ReactNode` | A string is wrapped in a styled `Text`; anything else renders as-is |
| `style` | `StyleProp<ViewStyle>` | The touchable |
| `textStyle` | `StyleProp<TextStyle>` | String children only |
| `containerStyle` | `StyleProp<ViewStyle>` | The outer animated wrapper, e.g. `{ flex: 1 }` to share a row |
| ...`TouchableOpacityProps` | | `onPress`, `disabled`, `accessibilityLabel`, ... |

Variants: `default` chalk fill / near-black text; `destructive` red;
`outline` background + `border`; `secondary` `#2a241f`; `ghost` transparent;
`link` transparent, underlined.

## How it works

`onPressIn` springs the wrapper to scale 0.9, `onPressOut` back to 1
(`Animated`, native driver), then calls the caller's handlers. `disabled`
halves opacity. Sets `accessibilityRole="button"`.

## Depends on

[Colors](../../constants/Colors.md), [useColorScheme](../../hooks/useColorScheme.md).

## Used by

[ConfirmDialog](ConfirmDialog.md), [PickNext](../../features/workouts/components/PickNext.md), [SetLogger](../../features/workouts/components/SetLogger.md),
[RoutineCard](../../features/workouts/components/RoutineCard.md), [RoutinesScreen](../../features/workouts/screens/RoutinesScreen.md),
[WorkoutHistoryCard](../../features/workouts/components/WorkoutHistoryCard.md),
[CreateCustomRoutineModal](../../features/workouts/components/CreateCustomRoutineModal.md),
[FastingScreen](../../features/fasting/screens/FastingScreen.md), [FastCompleteDialog](../../features/fasting/components/FastCompleteDialog.md),
[HydrationActions](../../features/water/components/HydrationActions.md).

## Tests

none.

## Gotchas / TODO

- The primary action colour in iron is the accent, but `variant="default"` is
  chalk; most callers override `backgroundColor: colors.accent` by hand. An
  `accent` variant would remove that repetition.
- Scale 0.9 is a strong press; uses the old `Animated` API, not Reanimated,
  and ignores Reduce Motion.
- `asChild` drops `onPress` and all props.
