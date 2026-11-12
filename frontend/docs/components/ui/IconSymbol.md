# `components/ui/IconSymbol.tsx`

## Purpose

The app's icon component on Android and web: takes an SF Symbol name and
draws the mapped Material Icon. iOS uses [IconSymbol.ios](IconSymbol.ios.md).

## Public API

`IconSymbol({ name: IconSymbolName, size?: number = 24, color: string | OpaqueColorValue, style?: StyleProp<TextStyle>, weight?: SymbolWeight })`.

`IconSymbolName` is a key of `MAPPING`: house.fill, paperplane.fill,
chevron.left.forwardslash.chevron.right, chevron.right/left/up/down, sun.max,
moon, bolt.fill, drop.fill, heart.fill, fork.knife, figure.run, flame.fill,
arrow.2.circlepath, shield.fill, gearshape(.fill), play.fill, stop.fill,
arrow.counterclockwise, chart.bar.fill, clock.fill, rectangle.grid.1x2.fill,
target, timer, calendar, chart.line.uptrend.xyaxis, lightbulb.fill,
plus.circle.fill, bell.fill, list.bullet, dumbbell.fill, calendar.badge.plus,
trophy.fill, square.grid.2x2.fill, folder.fill, book.fill, magnifyingglass,
list.bullet.rectangle, chart.pie.fill, star.fill, person.3.fill, flag.fill,
checkmark, plus, minus, arrow.uturn.backward.

## How it works

`<MaterialIcons name={MAPPING[name]} />`. `weight` is ignored here.

## Depends on

`@expo/vector-icons/MaterialIcons`, `expo-symbols` (types).

## Used by

Every screen with an icon: the tab bar, sidebar, SwipeToConfirm, Stepper,
PickNext, SetLogger, Fasting, Water, CircularProgress, Collapsible, Toast,
Dialog, RoutineExercisesStep, Explore.

## Tests

none.

## Gotchas / TODO

- To add an icon, add its SF Symbol name and Material name to `MAPPING`, or
  Android/web show nothing. The type only protects callers that do not cast;
  [VerticalTabBar](VerticalTabBar.md) and [CircularProgress](../../features/fasting/components/CircularProgress.md)
  pass `as any`. `FASTING_SCHEDULES` icons (`clock.3`, `pencil`, ...) are not
  mapped (they are not rendered yet).
- Lint: unused `IconMapping` type.
