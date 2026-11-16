/**
 * @file setLogging.ts
 * @description Pure helpers behind the swipe-to-log workout flow: what each
 * exercise did last time, which exercises to offer next, where the numbers
 * start and how far one nudge moves them. No React, so it is easy to test.
 *
 * Each exercise remembers its own numbers. There is no plan to edit: the
 * "What's next" list is just the exercises you have done for a muscle group,
 * most recent first.
 */

import type { Exercise, SavedWorkout, WeightUnit, WorkoutExercise, WorkoutSet } from '../types';

export interface LastPerformance {
  sets: WorkoutSet[];
  /** ISO date of the workout the sets came from. */
  date: string;
}

export interface NextOption {
  exercise: Exercise;
  last: LastPerformance | null;
  /** Sets already logged for this exercise in the current workout. */
  setsToday: number;
}

const done = (sets: WorkoutSet[]) => sets.filter((s) => s.completed);

/**
 * The most recent saved workout's completed sets for an exercise, or null if
 * it has never been logged. `history` may be in any order.
 */
export function lastPerformance(exerciseId: string, history: SavedWorkout[]): LastPerformance | null {
  let best: LastPerformance | null = null;
  for (const workout of history) {
    for (const ex of workout.exercises) {
      if (ex.exercise.id !== exerciseId) continue;
      const sets = done(ex.sets);
      if (!sets.length) continue;
      if (!best || new Date(workout.date) > new Date(best.date)) best = { sets, date: workout.date };
    }
  }
  return best;
}

/**
 * Exercises to offer next, for one muscle group (or all when `muscleGroup`
 * is null): ones in today's workout first, then the rest by when they were
 * last done, then never-done ones alphabetically.
 */
export function nextOptions(
  catalog: Exercise[],
  history: SavedWorkout[],
  session: WorkoutExercise[],
  muscleGroup: string | null,
): NextOption[] {
  const today = new Map(session.map((s) => [s.exercise.id, done(s.sets).length]));
  const options = catalog
    .filter((e) => !muscleGroup || e.muscleGroup === muscleGroup)
    .map((exercise) => ({
      exercise,
      last: lastPerformance(exercise.id, history),
      setsToday: today.get(exercise.id) ?? 0,
    }));
  const lastTime = (o: NextOption) => (o.last ? new Date(o.last.date).getTime() : -Infinity);
  return options.sort(
    (a, b) =>
      Number(today.has(b.exercise.id)) - Number(today.has(a.exercise.id)) ||
      lastTime(b) - lastTime(a) ||
      a.exercise.name.localeCompare(b.exercise.name),
  );
}

/** How much one tap of the weight stepper adds or removes. */
export function weightStep(equipment: Exercise['equipment'], unit: WeightUnit): number {
  if (unit === 'lbs') return 5;
  // Dumbbells usually go up in 2 kg pairs; plates and stacks in 2.5 kg.
  return equipment === 'Dumbbells' ? 2 : 2.5;
}

/**
 * Where the big numbers start for the next set: the set just logged today,
 * else the first working set from last time, else a sensible default.
 */
export function startingSet(
  equipment: Exercise['equipment'],
  today: WorkoutSet[],
  last: LastPerformance | null,
): { weight: number; reps: number } {
  const loggedToday = done(today);
  const from = loggedToday[loggedToday.length - 1] ?? last?.sets[0];
  if (from) return { weight: from.weight, reps: from.reps };
  return { weight: equipment === 'Bodyweight' ? 0 : 20, reps: 8 };
}

/** Adds `delta` and clamps to [min, max], without float noise (82.5, not 82.50000001). */
export function nudge(value: number, delta: number, min = 0, max = 999): number {
  const next = Math.round((value + delta) * 100) / 100;
  return Math.min(max, Math.max(min, next));
}

/** Weight without a needless ".0": 80, 82.5. */
export function formatWeight(weight: number): string {
  return Number.isInteger(weight) ? String(weight) : weight.toFixed(1).replace(/\.0$/, '');
}

/** "32 × 10, 32 × 10, 32 × 9". */
export function formatSets(sets: WorkoutSet[]): string {
  return sets.map((s) => `${formatWeight(s.weight)} × ${s.reps}`).join(', ');
}

const DAY = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** "today", "yesterday", "Mon" (this week), "2 weeks ago", "last month", "3 months ago". */
export function relativeDay(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(then)) / DAY);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return WEEKDAYS[then.getDay()];
  if (days < 14) return 'last week';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return 'last month';
  return `${Math.floor(days / 30)} months ago`;
}

/** Only the sets that were actually done, for saving a finished workout. */
export function completedOnly(exercises: WorkoutExercise[]): WorkoutExercise[] {
  return exercises
    .map((ex) => ({ ...ex, sets: done(ex.sets) }))
    .filter((ex) => ex.sets.length > 0);
}
