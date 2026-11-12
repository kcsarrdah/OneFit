/**
 * @file session.ts
 * @description Pure helpers for the current workout session: entries added
 * from a routine, logging and undoing sets, and counting what was logged.
 */

import type { Exercise, WorkoutExercise, WorkoutSet } from '../types';

/** Placeholder sets a routine's exercises start with: 3 × (20 × 8), not done. */
export const ROUTINE_DEFAULT_SET = { weight: 20, reps: 8 } as const;
const ROUTINE_SET_COUNT = 3;

/** Session entries for a routine's exercises, each with placeholder sets. */
export function routineEntries(exercises: Exercise[], now: number = Date.now()): WorkoutExercise[] {
  return exercises.map((exercise, index) => {
    const baseTime = now + index; // unique ids within one call
    const sets: WorkoutSet[] = Array.from({ length: ROUTINE_SET_COUNT }, (_, i) => ({
      id: `set_${baseTime}_${i + 1}`,
      ...ROUTINE_DEFAULT_SET,
      completed: false,
    }));
    return { id: `${baseTime}_${Math.random()}`, exercise, sets, notes: '' };
  });
}

/** Appends a completed set to one entry. */
export function withLoggedSet(
  entries: WorkoutExercise[],
  entryId: string,
  weight: number,
  reps: number,
): WorkoutExercise[] {
  const set: WorkoutSet = { id: `set_${Date.now()}_${Math.random()}`, weight, reps, completed: true };
  return entries.map((ex) => (ex.id === entryId ? { ...ex, sets: [...ex.sets, set] } : ex));
}

/** Drops the most recent set of one entry. */
export function withoutLastSet(entries: WorkoutExercise[], entryId: string): WorkoutExercise[] {
  return entries.map((ex) => (ex.id === entryId ? { ...ex, sets: ex.sets.slice(0, -1) } : ex));
}

/** Completed sets across the whole session. */
export function setsLogged(entries: WorkoutExercise[]): number {
  return entries.reduce((n, ex) => n + ex.sets.filter((s) => s.completed).length, 0);
}
