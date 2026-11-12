# OneFit app

The OneFit mobile app: Expo 53, React Native 0.79, expo-router, Reanimated and Gesture Handler. It runs on iOS, Android and the web. Data is stored on the device with AsyncStorage for now.

Design rules live in `DESIGN.md` and product context in `PRODUCT.md` at the repo root: dark "iron" theme only, one orange accent for actions, liquid glass tab bar and sidebar, swipe to confirm for logging.

## Structure

```
frontend/
  app/                    expo-router routes
    _layout.tsx           providers (theme, navigation), fonts, header
    (tabs)/_layout.tsx    tab bar (ScrollableTabBar) inside the glass sidebar layout
    (tabs)/*.tsx          one thin file per tab; feature tabs only re-export a screen
  features/               one folder per product area
    workouts/
      screens/            WorkoutsTab (sidebar switch), WorkoutScreen, RoutinesScreen,
                          ExercisesScreen, HistoryScreen
      components/         PickNext, SetLogger (swipe to log), RoutineCard,
                          CreateCustomRoutineModal (+ its two steps), WorkoutHistoryCard, ...
      hooks/              useWorkoutSession, useWorkoutHistory, useCustomRoutines, useWeightUnit
      lib/                pure logic: setLogging, session, history, routines
      constants.ts        exercise catalogue, starter routines, filter options
      types.ts            Exercise, WorkoutSet, WorkoutRoutine, SavedWorkout, ...
    fasting/
      screens/            FastingScreen
      components/         CircularProgress, FastCompleteDialog
      hooks/              useFastingTimer, useFastCompletion
      lib/format.ts       time formatting and progress
      constants.ts        schedules and milestones
      types.ts
    water/
      screens/            WaterScreen
      components/         WaterFill (Reanimated), HydrationActions
      hooks/              useHydration (storage, new-day reset)
      lib/hydration.ts    fill fraction, day key, history
      constants.ts        defaults and storage keys
    nutrition/
      screens/            NutritionScreen (placeholder for meal logging)
  components/
    ui/                   the shared UI library: Button, Card, Dialog, Input, Stepper,
                          BigNumber, SwipeToConfirm, ScrollableTabBar, VerticalTabBar, ...
    Themed*.tsx, ...      older shared helpers used by the starter screens
  constants/
    Colors.ts             theme tokens (iron palette, glass, water colours)
    Fonts.ts              Oswald display font names
  contexts/               NavigationContext (sidebar options, focus mode), ThemeContext
  hooks/                  app-wide hooks: useAsyncStorage, useToast, useColorScheme, useThemeColor
  __tests__/              Jest tests, mirroring the source tree (e.g. __tests__/features/water/lib)
```

### Conventions

- A feature owns its screens, components, hooks, pure logic and constants. Code used by more than one feature goes to `components/ui`, `hooks/` or `constants/`.
- Inside a feature, import with relative paths (`../lib/session`); from outside, use the `@/` alias (`@/features/water/screens/WaterScreen`).
- Pure logic (calculations, formatting, ordering) lives in `lib/` and has unit tests in `__tests__/features/<feature>/lib/`.
- Reuse `components/ui` before writing a new primitive. Keep files under about 300 lines.
- Colours and fonts come from `constants/Colors.ts` and `constants/Fonts.ts`; there is no light theme.
- Animations use Reanimated on the UI thread (transforms and opacity, not layout props) and respect Reduce Motion (`useReducedMotion`).

## Run

```bash
cd frontend
npm install
npx expo start          # then press i (iOS simulator), a (Android) or w (web)
npx expo start --web    # web only, http://localhost:8081
```

The fasting dialog saves to the backend at `http://localhost:3000` in development (`cd backend && go run .`). Everything else works offline.

## Test and check

```bash
npx jest                # unit tests
npx tsc --noEmit        # type-check
npx eslint app components hooks constants contexts features
```

All three should pass with no errors before a change is merged, and with no lint warnings in the files the change touches.
