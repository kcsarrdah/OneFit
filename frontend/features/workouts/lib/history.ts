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

/** Seconds as "m:ss": 754 -> "12:34". */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}

/** ISO date as "Nov 12, 2026". */
export function formatWorkoutDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
