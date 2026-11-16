/**
 * @file routines.ts
 * @description Pure helpers for workout routines: listing built-in and custom
 * routines together, filtering by category, and building new custom routines.
 */

import type { CustomRoutine, Exercise, NewRoutine, RoutineCategory, WorkoutRoutine } from '../types';

export type AnyRoutine = WorkoutRoutine | CustomRoutine;

/** True for routines the user made or duplicated (they can be deleted). */
export function isCustomRoutine(routine: AnyRoutine): routine is CustomRoutine {
  return 'isCustom' in routine && routine.isCustom;
}

/** Built-in routines first (marked not custom), then the user's own. */
export function allRoutines(builtIn: WorkoutRoutine[], custom: CustomRoutine[]): AnyRoutine[] {
  return [...builtIn.map((routine) => ({ ...routine, isCustom: false })), ...custom];
}

/** Routines in one category, or all of them for 'All'. */
export function filterRoutines<T extends AnyRoutine>(routines: T[], filter: 'All' | RoutineCategory): T[] {
  return filter === 'All' ? routines : routines.filter((routine) => routine.category === filter);
}

/** A new custom routine from the form's fields. */
export function createRoutine(fields: NewRoutine, now: Date = new Date()): CustomRoutine {
  const stamp = now.toISOString();
  return {
    ...fields,
    id: `custom-${now.getTime()}`,
    isCustom: true,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

/** A custom copy of any routine, named "<name> (Copy)". */
export function duplicateOf(routine: AnyRoutine, now: Date = new Date()): CustomRoutine {
  const stamp = now.toISOString();
  return {
    ...routine,
    id: `custom-${now.getTime()}`,
    name: `${routine.name} (Copy)`,
    isCustom: true,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

/**
 * The catalogue filtered for the exercise pickers: name contains `query`
 * (case-insensitive), in `muscleGroup` if one is chosen, and not already in
 * `exclude`.
 */
export function searchExercises(
  catalog: Exercise[],
  query: string,
  muscleGroup: string | null,
  exclude: Exercise[] = [],
): Exercise[] {
  const q = query.toLowerCase();
  const taken = new Set(exclude.map((e) => e.id));
  return catalog.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(q) &&
      (!muscleGroup || exercise.muscleGroup === muscleGroup) &&
      !taken.has(exercise.id),
  );
}
