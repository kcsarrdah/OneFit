# OneFit app docs

One Markdown file per source and test file in `frontend/`, mirroring the tree
(`features/workouts/components/SetLogger.tsx` →
`docs/features/workouts/components/SetLogger.md`). Code extensions are dropped
(`.ts`, `.tsx`, `.js`; `IconSymbol.ios.tsx` → `IconSymbol.ios.md`,
`setLogging.test.ts` → `setLogging.test.md`); other files keep theirs
(`app.json` → `app.json.md`). Every doc follows [`_TEMPLATE.md`](_TEMPLATE.md).
Test coverage, how to run the checks and the last results:
[`tests/README.md`](tests/README.md). Setup and commands: [`../README.md`](../README.md).

## Architecture

```
app/_layout.tsx          GestureHandlerRootView > ThemeProvider > (fonts) > NavigationProvider
                         > navigation theme > Stack (header "OneFit", hidden in focus mode)
app/(tabs)/_layout.tsx   SidebarLayout (VerticalTabBar, floating) > Tabs (tabBar = ScrollableTabBar, floating)
app/(tabs)/<tab>.tsx     one line: export { XScreen as default } from '@/features/<x>/screens/XScreen'
features/<x>/            screens/ → components/ → hooks/ (state + AsyncStorage) → lib/ (pure, tested)
components/ui/           shared primitives: Button, Card, Dialog, Input, Stepper, BigNumber, SwipeToConfirm, ...
constants/               Colors (iron), Fonts (Oswald)
```

**Routes are thin.** expo-router builds routes from `app/`. Each feature tab
file is a one-line re-export of a screen in `features/` (`fasting`, `water`,
`nutrition`, `workouts`). Home (`index`), Explore and Habits are still
placeholders with their content inline.

**Feature folders.** `features/<feature>/` owns everything for one product
area: `screens/` (compose, little logic), `components/`, `hooks/` (state and
storage), `lib/` (pure functions with unit tests), `constants.ts`, `types.ts`.
Inside a feature use relative imports; from outside use `@/features/...`.
Code shared by several features goes to `components/ui`, `hooks/`,
`constants/` or `contexts/`.

**Navigation.** Three layers, all floating:

- The **stack header** ("OneFit") from [app/_layout](app/_layout.md).
- The **liquid glass tab bar** ([ScrollableTabBar](components/ui/ScrollableTabBar.md))
  along the bottom: seven tabs, horizontally scrollable.
- The **liquid glass sidebar** ([VerticalTabBar](components/ui/VerticalTabBar.md))
  on the left, driven by [NavigationContext](contexts/NavigationContext.md):
  the route sets `currentMode`, the mode's config lists the sidebar options,
  and a tap sets `currentSidebarOption`. Screens switch content on that value
  (only [WorkoutsTab](features/workouts/screens/WorkoutsTab.md) does today:
  Workout, Routines, Exercises, History). Global options (Analytics,
  Settings) `router.push` to routes that do not exist yet.
- **Focus mode** (`setFocusMode(true)`, set by [WorkoutScreen](features/workouts/screens/WorkoutScreen.md)
  while a set is being logged) hides the header, tab bar and sidebar.

The glass is two translucent layers (70% fill + 3% overlay + hairline border),
not a real blur. The sidebar overlays content; screens must inset themselves
(`GlassEffectConfig.dimensions.vertical.contentInset`), which only
[PickNext](features/workouts/components/PickNext.md) does.

**Theming.** Dark only. [Colors](constants/Colors.md) defines the iron
palette (warm near-black `#0b0908`, chalk `#f3ece4`, one orange accent
`#ff6a1f` for actions) and exports it as both `Colors.light` and
`Colors.dark`, so older code that asks for `'light'` still gets iron.
[ThemeContext](contexts/ThemeContext.md) always reports `'dark'`. Water uses
its own blues (`WaterColors`). Display type is Oswald ([Fonts](constants/Fonts.md),
loaded in `app/_layout`); body text is the platform sans. Newer screens use
`Colors.dark` and `Fonts` directly; older ones go through
[useThemeColor](hooks/useThemeColor.md) / `ThemedText`.

**Storage.** Everything is on the device in AsyncStorage (JSON):

| Feature | Keys | Doc |
|---|---|---|
| Workouts | `workout_current_session`, `workout_history`, `custom-routines`, `workout_weight_unit` | [useWorkoutSession](features/workouts/hooks/useWorkoutSession.md), [useWorkoutHistory](features/workouts/hooks/useWorkoutHistory.md), [useCustomRoutines](features/workouts/hooks/useCustomRoutines.md), [useWeightUnit](features/workouts/hooks/useWeightUnit.md) |
| Fasting | `fastingTimerState` | [useFastingTimer](features/fasting/hooks/useFastingTimer.md) |
| Water | `aquaViz_dailyGoal`, `aquaViz_defaultLogAmount`, `aquaViz_currentIntake`, `aquaViz_intakeDate`, `aquaViz_hydrationHistory` | [useHydration](features/water/hooks/useHydration.md) |
| Theme | `theme-preference` (stored, not applied) | [ThemeContext](contexts/ThemeContext.md) |

**Backend.** The app does not use the Go backend yet, with one exception:
saving a completed fast POSTs to `http://localhost:3000/api/fasts` in
development ([useFastCompletion](features/fasting/hooks/useFastCompletion.md)).
That call cannot succeed today: the endpoint requires a Firebase token the
app does not have, and the path lacks the trailing slash. There is no auth,
sync or API client in the app.

**Swipe to log** (the Workouts tab, `CLAUDE.md` rule 4):

1. [PickNext](features/workouts/components/PickNext.md) ("What's next?")
   lists exercises for a muscle group, ordered by
   [nextOptions](features/workouts/lib/setLogging.md): in today's workout,
   then most recently done, then by name, each with its last numbers.
2. Tapping one calls `startExercise` ([useWorkoutSession](features/workouts/hooks/useWorkoutSession.md))
   and opens [SetLogger](features/workouts/components/SetLogger.md) full
   screen in focus mode. Two [BigNumber](components/ui/BigNumber.md)s start
   from [startingSet](features/workouts/lib/setLogging.md) (this exercise's
   last set); [Stepper](components/ui/Stepper.md)s nudge them.
3. The accent bar at the bottom is [SwipeToConfirm](components/ui/SwipeToConfirm.md):
   drag it up past 40% (or flick) and it fills the screen, then `onLog`
   records the set.
4. The rest screen takes over in the same orange: "Set N logged", a 2:00
   countdown, today's sets, Undo, "Next exercise" (back to step 1) and
   "Set N+1" (the colour lowers back into the bar, numbers kept).
5. "Finish" on PickNext saves the completed sets to history and resets the
   session.

## Keeping these docs current

`CLAUDE.md` rule 2: in the same change as the code, create the doc for a new
file, update the doc of every file you touch, delete the doc of a removed
file, and update this index. Copy [`_TEMPLATE.md`](_TEMPLATE.md). Test docs
say what each suite covers and what it does not. After running the checks,
update [tests/README](tests/README.md). Never copy secrets into docs.

## Index

### Root config

- [app.json.md](app.json.md): Expo config: dark UI, plugins, typed routes, static web.
- [babel.config.md](babel.config.md): Expo preset and the Reanimated plugin.
- [eslint.config.md](eslint.config.md): Expo flat lint config.
- [jest.config.md](jest.config.md): Jest preset, alias, transforms.
- [tsconfig.json.md](tsconfig.json.md): strict TS, `@/` alias.

### `app/`

- [_layout.md](app/_layout.md): providers, fonts, navigation theme, header hidden in focus mode.
- [+not-found.md](app/+not-found.md): unknown-route screen.
- [(tabs)/_layout.md](app/(tabs)/_layout.md): the seven tabs, glass tab bar, sidebar layout.
- [(tabs)/index.md](app/(tabs)/index.md): Home, Expo template placeholder.
- [(tabs)/explore.md](app/(tabs)/explore.md): Explore, Expo template placeholder.
- [(tabs)/habits.md](app/(tabs)/habits.md): Habits placeholder.
- [(tabs)/fasting.md](app/(tabs)/fasting.md): re-exports `FastingScreen`.
- [(tabs)/water.md](app/(tabs)/water.md): re-exports `WaterScreen`.
- [(tabs)/nutrition.md](app/(tabs)/nutrition.md): re-exports `NutritionScreen`.
- [(tabs)/workouts.md](app/(tabs)/workouts.md): re-exports `WorkoutsTab`.

### `components/`

- [Collapsible.md](components/Collapsible.md): template toggle section (Explore only).
- [ExternalLink.md](components/ExternalLink.md): template in-app browser link (Explore only).
- [HapticTab.md](components/HapticTab.md): template haptic tab button (unused).
- [HelloWave.md](components/HelloWave.md): template waving hand (Home).
- [ParallaxScrollView.md](components/ParallaxScrollView.md): template parallax header (Home, Explore).
- [ThemedText.md](components/ThemedText.md): `Text` with theme colour and five types.
- [ThemedView.md](components/ThemedView.md): `View` with theme background.

### `components/ui/`

- [Badge.md](components/ui/Badge.md): pill label; muscle-group and standard variants.
- [BigNumber.md](components/ui/BigNumber.md): huge tappable number (set logger).
- [Button.md](components/ui/Button.md): variants, sizes, press scale.
- [Card.md](components/ui/Card.md): card and its parts.
- [Checkbox.md](components/ui/Checkbox.md): animated checkbox (unused).
- [Dialog.md](components/ui/Dialog.md): modal dialog and parts.
- [ConfirmDialog.md](components/ui/ConfirmDialog.md): "Are you sure?" for destructive actions (works on web).
- [IconSymbol.md](components/ui/IconSymbol.md): SF Symbol names mapped to Material Icons (Android, web).
- [IconSymbol.ios.md](components/ui/IconSymbol.ios.md): native SF Symbols (iOS).
- [Input.md](components/ui/Input.md): text field.
- [Label.md](components/ui/Label.md): form label (unused).
- [NumberInput.md](components/ui/NumberInput.md): numeric field with steppers.
- [Popover.md](components/ui/Popover.md): modal popover (fasting milestones).
- [RadioGroup.md](components/ui/RadioGroup.md): radio buttons via context.
- [ScrollableTabBar.md](components/ui/ScrollableTabBar.md): floating glass tab bar.
- [SideBarLayout.md](components/ui/SideBarLayout.md): wraps tabs with the sidebar.
- [Stepper.md](components/ui/Stepper.md): minus/plus pill.
- [SwipeToConfirm.md](components/ui/SwipeToConfirm.md): Robinhood-style swipe up to confirm.
- [TabBarBackground.md](components/ui/TabBarBackground.md): template tab background; `useBottomTabOverflow` (0).
- [TabBarBackground.ios.md](components/ui/TabBarBackground.ios.md): blurred variant; real tab bar height.
- [Textarea.md](components/ui/Textarea.md): multi-line field.
- [Toast.md](components/ui/Toast.md): one sliding toast.
- [Toaster.md](components/ui/Toaster.md): toast list (not mounted).
- [VerticalTabBar.md](components/ui/VerticalTabBar.md): floating glass sidebar.

### `constants/`

- [Colors.md](constants/Colors.md): iron palette, water blues, glass colours and geometry.
- [Fonts.md](constants/Fonts.md): Oswald display font names.

### `contexts/`

- [NavigationContext.md](contexts/NavigationContext.md): mode, sidebar options, focus mode.
- [ThemeContext.md](contexts/ThemeContext.md): theme preference; always dark.

### `hooks/`

- [useAsyncStorage.md](hooks/useAsyncStorage.md): JSON AsyncStorage wrapper.
- [useColorScheme.md](hooks/useColorScheme.md): scheme from ThemeContext (native).
- [useColorScheme.web.md](hooks/useColorScheme.web.md): browser scheme after hydration (web).
- [useThemeColor.md](hooks/useThemeColor.md): one colour token for the scheme.
- [useToast.md](hooks/useToast.md): global toast store.

### `scripts/`

- [reset-project.md](scripts/reset-project.md): Expo template reset (destructive, obsolete).

### `features/workouts/`

- [types.md](features/workouts/types.md): exercise, set, routine, saved workout types.
- [constants.md](features/workouts/constants.md): 22 exercises, 5 starter routines, filter lists.
- [screens/WorkoutsTab.md](features/workouts/screens/WorkoutsTab.md): sidebar switch; owns the session.
- [screens/WorkoutScreen.md](features/workouts/screens/WorkoutScreen.md): swipe-to-log (PickNext ↔ SetLogger), finish.
- [screens/RoutinesScreen.md](features/workouts/screens/RoutinesScreen.md): routines list, filter, create.
- [screens/HistoryScreen.md](features/workouts/screens/HistoryScreen.md): progress stats and saved workouts.
- [screens/ExercisesScreen.md](features/workouts/screens/ExercisesScreen.md): placeholder.
- [components/PickNext.md](features/workouts/components/PickNext.md): "What's next?" list, search, finish.
- [components/SetLogger.md](features/workouts/components/SetLogger.md): big numbers, swipe to log, rest takeover.
- [components/RoutineCard.md](features/workouts/components/RoutineCard.md): one routine with actions.
- [components/WorkoutHistoryCard.md](features/workouts/components/WorkoutHistoryCard.md): one saved workout.
- [components/StatColumn.md](features/workouts/components/StatColumn.md): number over label.
- [components/CenteredMessage.md](features/workouts/components/CenteredMessage.md): loading/empty message.
- [components/CreateCustomRoutineModal.md](features/workouts/components/CreateCustomRoutineModal.md): two-step create dialog.
- [components/RoutineDetailsStep.md](features/workouts/components/RoutineDetailsStep.md): step 1, details.
- [components/RoutineExercisesStep.md](features/workouts/components/RoutineExercisesStep.md): step 2, exercises.
- [hooks/useWorkoutSession.md](features/workouts/hooks/useWorkoutSession.md): workout in progress, auto-saved.
- [hooks/useWorkoutHistory.md](features/workouts/hooks/useWorkoutHistory.md): saved workouts and totals.
- [hooks/useCustomRoutines.md](features/workouts/hooks/useCustomRoutines.md): built-in + custom routines.
- [hooks/useWeightUnit.md](features/workouts/hooks/useWeightUnit.md): kg/lbs preference.
- [lib/setLogging.md](features/workouts/lib/setLogging.md): last performance, next options, starting set, nudge, formats.
- [lib/session.md](features/workouts/lib/session.md): routine entries, log/undo, count.
- [lib/history.md](features/workouts/lib/history.md): totals, saved workout, stats, formats.
- [lib/routines.md](features/workouts/lib/routines.md): list, filter, create, duplicate, search.

### `features/fasting/`

- [types.md](features/fasting/types.md): `CompletedFastData`.
- [constants.md](features/fasting/constants.md): schedules and milestones.
- [screens/FastingScreen.md](features/fasting/screens/FastingScreen.md): FastTrack ring, start/complete/reset.
- [components/CircularProgress.md](features/fasting/components/CircularProgress.md): SVG progress ring.
- [components/FastCompleteDialog.md](features/fasting/components/FastCompleteDialog.md): save or discard a fast.
- [hooks/useFastingTimer.md](features/fasting/hooks/useFastingTimer.md): running fast, persisted start time.
- [hooks/useFastCompletion.md](features/fasting/hooks/useFastCompletion.md): dialog state, POST to the backend.
- [lib/format.md](features/fasting/lib/format.md): time formats and progress.

### `features/water/`

- [constants.md](features/water/constants.md): defaults and storage keys.
- [screens/WaterScreen.md](features/water/screens/WaterScreen.md): intake, remaining, fill.
- [components/WaterFill.md](features/water/components/WaterFill.md): Reanimated rising water.
- [components/HydrationActions.md](features/water/components/HydrationActions.md): log and reset buttons.
- [hooks/useHydration.md](features/water/hooks/useHydration.md): intake, new-day reset, history.
- [lib/hydration.md](features/water/lib/hydration.md): day key, fill fraction, history.

### `features/nutrition/`

- [screens/NutritionScreen.md](features/nutrition/screens/NutritionScreen.md): placeholder.

### `__tests__/`

- [setup.md](__tests__/setup.md): global mocks (AsyncStorage, Reanimated, a minimal `react-native`).
- [features/workouts/lib/setLogging.test.md](__tests__/features/workouts/lib/setLogging.test.md): swipe-to-log logic.
- [features/workouts/lib/session.test.md](__tests__/features/workouts/lib/session.test.md): session helpers.
- [features/workouts/lib/history.test.md](__tests__/features/workouts/lib/history.test.md): history helpers.
- [features/workouts/lib/routines.test.md](__tests__/features/workouts/lib/routines.test.md): routine helpers.
- [features/fasting/lib/format.test.md](__tests__/features/fasting/lib/format.test.md): fasting formats.
- [features/fasting/hooks/useFastingTimer.test.md](__tests__/features/fasting/hooks/useFastingTimer.test.md): timer hook.
- [features/fasting/hooks/useFastCompletion.test.md](__tests__/features/fasting/hooks/useFastCompletion.test.md): completion hook, mocked fetch.
- [features/water/lib/hydration.test.md](__tests__/features/water/lib/hydration.test.md): hydration helpers.

### Other

- [tests/README.md](tests/README.md): how to run, last results, coverage gaps.
- [_TEMPLATE.md](_TEMPLATE.md): the doc template.
