# App tests

## How to run

```bash
cd frontend
npx jest                       # all suites once (same as npm test)
npx jest --watch               # watch mode (npm run test:watch)
npx jest --coverage            # coverage for hooks/, components/, features/
npx jest __tests__/features/water   # one folder or file
npx tsc --noEmit               # type-check
npx eslint app components hooks constants contexts features
```

Config: [jest.config](../jest.config.md) (`react-native` preset, `node`
environment, `@/` alias) and [setup](../__tests__/setup.md) (AsyncStorage and
Reanimated mocks, a stubbed `react-native` with only `AppState`/`Platform`,
stubbed `setInterval`). Tests live in `__tests__/`, mirroring the source tree.

## Last run

2026-11-12, on branch `docs/frontend` (code identical to `docs/web`):

| Check | Result |
|---|---|
| `npx jest` | **8 suites, 71 tests, all passed** (≈1.6 s). The two `useFastCompletion` error tests print expected `console.error` output; watchman may print a recrawl warning. |
| `npx tsc --noEmit` | no errors |
| `npx eslint app components hooks constants contexts features` | **0 errors, 26 warnings**, all in shared files (below) |

Lint warnings by file: `components/ui/Checkbox.tsx` 4 (unused `IconSymbol`,
`foregroundColor`, `mutedColor`; hook deps), `Dialog.tsx` 1 (hook deps),
`IconSymbol.tsx` 1 (unused `IconMapping`), `NumberInput.tsx` 4 (hook deps),
`RadioGroup.tsx` 3 (unused imports), `ScrollableTabBar.tsx` 5 (unused imports
and `config`, duplicate import), `SideBarLayout.tsx` 1 (unused `Platform`),
`Toast.tsx` 1 (hook deps), `VerticalTabBar.tsx` 2 (duplicate import),
`hooks/useAsyncStorage.ts` 1 (unused `useEffect`), `hooks/useToast.ts` 3
(`actionTypes` type-only, `Array<T>`, `Toast` redeclared). No warnings in
`app/` or `features/`.

## Suites

| Suite | Tests | Covers | Notably not covered |
|---|---|---|---|
| [setLogging.test](../__tests__/features/workouts/lib/setLogging.test.md) | 12 | Last performance, "what's next" order, starting numbers, steps and nudges, relative days, completed-only | `null` muscle group order, future dates |
| [routines.test](../__tests__/features/workouts/lib/routines.test.md) | 9 | Create, duplicate, list, filter, exercise search | `useCustomRoutines` storage |
| [history.test](../__tests__/features/workouts/lib/history.test.md) | 7 | Totals, saved workout, sort, overall stats, formatting | Mixed units, `useWorkoutHistory` |
| [session.test](../__tests__/features/workouts/lib/session.test.md) | 4 | Routine entries, log, undo, count | `useWorkoutSession` (storage, `startTime`) |
| [format.test](../__tests__/features/fasting/lib/format.test.md) | 11 | Time formats, clock, expected end, progress | |
| [useFastingTimer.test](../__tests__/features/fasting/hooks/useFastingTimer.test.md) | 10 | Start, stop, reset, ticking, overtime, restore | Restore after the goal passed (the lost-fast bug), goal mismatch, `AppState` |
| [useFastCompletion.test](../__tests__/features/fasting/hooks/useFastCompletion.test.md) | 10 | Open, close, notes, save OK / HTTP error / network error, discard, loading | Toast content, timeout; it pins the unauthenticated, no-slash URL |
| [hydration.test](../__tests__/features/water/lib/hydration.test.md) | 8 | Day key, fill fraction, remaining, 30-day history | `useHydration` (new-day reset) |

## Gaps

- **No component or screen tests.** The setup's `react-native` mock exports
  only `AppState` and `Platform`, so nothing that renders a `View` can be
  tested. Fixing the setup (spread `jest.requireActual('react-native')`) is
  the first step to testing `SetLogger`, `PickNext`, `SwipeToConfirm`,
  `BigNumber`, `WaterFill` and the screens.
- **Storage hooks are untested**: `useWorkoutSession`, `useWorkoutHistory`,
  `useCustomRoutines`, `useWeightUnit`, `useHydration`, `useAsyncStorage`.
  Their pure logic is tested in `lib/`.
- **Navigation** (`NavigationContext`, the tab bar, the sidebar, focus mode)
  and `useToast` have no tests.
- No end-to-end tests; UI changes are checked by hand in the browser pane at
  375 x 812 (`CLAUDE.md`, "Verifying UI").
