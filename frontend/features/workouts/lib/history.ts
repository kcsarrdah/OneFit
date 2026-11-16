/**
 * @file history.ts
 * @description Pure helpers behind workout history: building a saved workout
 * from a finished session, the totals on the History screen, and formatting.
 */

import type { SavedWorkout, WeightUnit, WorkoutExercise } from '../types';

export interface WorkoutTotals {
  totalSets: number;
  completedSets: number;
  /** Sum of weight × reps over completed sets. */
  totalVolume: number;
}

export function workoutTotals(exercises: WorkoutExercise[]): WorkoutTotals {
  let totalSets = 0;
  let completedSets = 0;
  let totalVolume = 0;
  for (const ex of exercises) {
    for (const set of ex.sets) {
      totalSets += 1;
      if (!set.completed) continue;
      completedSets += 1;
      totalVolume += set.weight * set.reps;
    }
  }
  return { totalSets, completedSets, totalVolume };
}

/** A finished workout, ready to store. `duration` is in seconds. */
export function buildSavedWorkout(
  exercises: WorkoutExercise[],
  duration: number,
  weightUnit: WeightUnit,
  now: Date = new Date(),
): SavedWorkout {
  return {
    id: `workout_${now.getTime()}_${Math.random()}`,
    name: `Workout ${now.toLocaleDateString()}`,
    date: now.toISOString(),
    exercises,
    duration,
    weightUnit,
    ...workoutTotals(exercises),
  };
}

/** Newest first. Does not mutate `history`. */
export function sortByNewest(history: SavedWorkout[]): SavedWorkout[] {
  return [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export interface OverallStats {
  totalWorkouts: number;
  /** Seconds. */
  totalDuration: number;
  totalVolume: number;
}

export function overallStats(history: SavedWorkout[]): OverallStats {
  return {
    totalWorkouts: history.length,
    totalDuration: history.reduce((total, w) => total + w.duration, 0),
    totalVolume: history.reduce((total, w) => total + w.totalVolume, 0),
  };
}

/** A big number kept short: "4,240" below 10,000, then "24.3k", "1.2M". */
export function formatCompact(n: number): string {
  const v = Math.round(n);
  if (v < 10_000) return v.toLocaleString('en-US');
  if (v < 1_000_000) return `${+(v / 1000).toFixed(1)}k`;
  return `${+(v / 1_000_000).toFixed(1)}M`;
}

/**
 * One workout's numbers on one line: "52 MIN · 18/20 SETS · 4,240 KG". Each
 * number is tied to its unit with a no-break space, so a narrow row wraps
 * between items, never inside one.
 */
export function formatWorkoutSummary(workout: SavedWorkout): string {
  const nb = '\u00A0';
  const minutes = Math.round(workout.duration / 60);
  const sets = `${workout.completedSets}/${workout.totalSets}`;
  const volume = formatCompact(workout.totalVolume);
  return [`${minutes}${nb}MIN`, `${sets}${nb}SETS`, `${volume}${nb}${workout.weightUnit.toUpperCase()}`].join(' · ');
}

/** "Today, 7:12 PM", "Yesterday, 6:05 PM", or "Sat, Nov 14" (plus the year when it isn't this year). */
export function formatWorkoutDay(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (days === 0) return `Today, ${time}`;
  if (days === 1) return `Yesterday, ${time}`;
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  });
}
