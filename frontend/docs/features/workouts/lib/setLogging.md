# `features/workouts/lib/setLogging.ts`

## Purpose

Pure helpers behind the swipe-to-log flow: what each exercise did last time,
which exercises to offer next, where the numbers start and how far one nudge
moves them. No React.

## Public API

| Export | Signature | Does |
|---|---|---|
| `LastPerformance` | `{ sets: WorkoutSet[]; date: string }` | |
| `NextOption` | `{ exercise; last: LastPerformance \| null; setsToday: number }` | |
| `lastPerformance` | `(exerciseId, history: SavedWorkout[]) => LastPerformance \| null` | Completed sets from the most recent workout (by `date`) that logged this exercise; history may be in any order |
| `nextOptions` | `(catalog, history, session, muscleGroup \| null) => NextOption[]` | Exercises for the muscle group (all if null), sorted: in today's session first, then most recently done, then never-done by name |
| `weightStep` | `(equipment, unit) => number` | 5 lbs; in kg 2 for Dumbbells, else 2.5 |
| `startingSet` | `(equipment, today: WorkoutSet[], last) => { weight, reps }` | Last completed set today, else the first set from last time, else 20 x 8 (0 x 8 for Bodyweight) |
| `nudge` | `(value, delta, min = 0, max = 999) => number` | Add, round to 2 dp, clamp |
| `formatWeight` | `(n) => string` | `80`, `82.5` (no `.0`) |
| `formatSets` | `(sets) => string` | `"32 × 10, 32 × 10"` |
| `relativeDay` | `(iso, now = new Date()) => string` | today, yesterday, weekday name (< 7 days), last week, N weeks ago, last month, N months ago |
| `completedOnly` | `(exercises) => WorkoutExercise[]` | Only completed sets; drops exercises left empty |

## How it works

There is no plan to edit: each exercise remembers its own numbers, and "What's
next" is just the exercises you have done for a muscle group, most recent
first. `setsToday` counts only completed sets, but an exercise that is in the
session with zero completed sets (e.g. from a started routine) still sorts
into the "today" group.

`relativeDay` compares local calendar days (start of day in local time).

## Depends on

[types](../types.md).

## Used by

[WorkoutScreen](../screens/WorkoutScreen.md), [PickNext](../components/PickNext.md),
[SetLogger](../components/SetLogger.md).

## Tests

[setLogging.test](../../../__tests__/features/workouts/lib/setLogging.test.md).

## Gotchas / TODO

- `lastPerformance` is O(history x exercises) and `nextOptions` calls it for
  every catalogue entry; fine for 22 exercises and modest history.
- `startingSet` uses `last.sets[0]` (the first working set), not the best or
  last one.
- `nudge` does not snap to the step grid: 81 + 2.5 = 83.5.
