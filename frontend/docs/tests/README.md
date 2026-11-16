# App tests

## How to run

```bash
cd frontend
npx jest                       # all suites once (same as npm test)
npx jest --watch               # watch mode (npm run test:watch)
npx jest --coverage            # coverage for hooks/, components/, features/
npx jest __tests__/features/water   # one folder or file
npx tsc --noEmit               # type-check
npx eslint app components hooks constants contexts features lib
```

Config: [jest.config](../jest.config.md) (`react-native` preset, `node`
environment, `@/` alias) and [setup](../__tests__/setup.md) (AsyncStorage and
Reanimated mocks, a stubbed `react-native` with only `AppState`/`Platform`,
stubbed `setInterval`). Tests live in `__tests__/`, mirroring the source tree.

## Last run

2026-11-16, on branch `feat/app-screen-pass` (the screen pass, stacked on the data-loss fixes):

| Check | Result |
|---|---|
| `npx jest` | **11 suites, 94 tests, all passed** (≈0.8 s). The two `useFastCompletion` error tests print expected `console.error` output; watchman may print a recrawl warning. |
| `npx tsc --noEmit` | no errors |
| `npx eslint app components hooks constants contexts features lib` | **0 errors, 19 warnings**, all in shared files (below) |

Lint warnings by file: `components/ui/Checkbox.tsx` 4 (unused `IconSymbol`,
`foregroundColor`, `mutedColor`; hook deps), `Dialog.tsx` 1 (hook deps),
`IconSymbol.tsx` 1 (unused `IconMapping`), `NumberInput.tsx` 4 (hook deps),
`RadioGroup.tsx` 3 (unused imports), `SideBarLayout.tsx` 1 (unused `Platform`),
`Toast.tsx` 1 (hook deps),
`hooks/useAsyncStorage.ts` 1 (unused `useEffect`), `hooks/useToast.ts` 3
(`actionTypes` type-only, `Array<T>`, `Toast` redeclared). No warnings in
`app/` or `features/`.

## Suites

| Suite | Tests | Covers | Notably not covered |
|---|---|---|---|
| [setLogging.test](../__tests__/features/workouts/lib/setLogging.test.md) | 12 | Last performance, "what's next" order, starting numbers, steps and nudges, relative days, completed-only | `null` muscle group order, future dates |
| [routines.test](../__tests__/features/workouts/lib/routines.test.md) | 11 | Create, duplicate, list, filter, summary line, exercise search | `useCustomRoutines` storage |
| [history.test](../__tests__/features/workouts/lib/history.test.md) | 8 | Totals, saved workout, sort, overall stats, compact numbers, summary line, relative day | Mixed units, `useWorkoutHistory` |
| [session.test](../__tests__/features/workouts/lib/session.test.md) | 4 | Routine entries, log, undo, count | `useWorkoutSession` (storage, `startTime`) |
| [format.test](../__tests__/features/fasting/lib/format.test.md) | 9 | Hours clock, fast length, day and time, expected end, progress | |
| [useFastingTimer.test](../__tests__/features/fasting/hooks/useFastingTimer.test.md) | 12 | Start, stop, reset, ticking, overtime, restore | Restore after the goal passed (the lost-fast bug), goal mismatch, `AppState` |
| [useFastCompletion.test](../__tests__/features/fasting/hooks/useFastCompletion.test.md) | 10 | Open, close, notes, save OK / HTTP error / network error, discard, loading | Toast content, timeout; it pins the unauthenticated, no-slash URL |
| [restore.test](../__tests__/features/fasting/lib/restore.test.md) | 4 | Resume or complete a stored fast | see its doc |
| [useHydration.test](../__tests__/features/water/hooks/useHydration.test.md) | 4 | Water hook, rollover past midnight | see its doc |
| [tabBarScroll.test](../__tests__/lib/tabBarScroll.test.md) | 4 | Centring a tab, clamped at both ends, everything fits | The tab bar component |
| [hydration.test](../__tests__/features/water/lib/hydration.test.md) | 16 | Day key, fill fraction, remaining, 30-day history | `useHydration` (new-day reset) |

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
  and `useToast` have no tests, beyond the tab bar's scroll maths.
- No end-to-end tests; UI changes are checked by hand in the browser pane at
  375 x 812 (`CLAUDE.md`, "Verifying UI").
