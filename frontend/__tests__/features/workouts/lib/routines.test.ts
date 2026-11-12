import { EXERCISES, WORKOUT_ROUTINES } from '@/features/workouts/constants';
import {
  allRoutines,
  createRoutine,
  duplicateOf,
  filterRoutines,
  isCustomRoutine,
  searchExercises,
} from '@/features/workouts/lib/routines';
import type { CustomRoutine } from '@/features/workouts/types';

const now = new Date('2026-11-12T10:00:00.000Z');
const ex = (id: string) => EXERCISES.find((e) => e.id === id)!;

const custom: CustomRoutine = {
  ...createRoutine(
    {
      name: 'Push day',
      description: '',
      exercises: [ex('bench-press')],
      estimatedDuration: 30,
      difficulty: 'Beginner',
      category: 'Strength',
    },
    now,
  ),
};

describe('createRoutine', () => {
  it('stamps id, custom flag and dates from `now`', () => {
    expect(custom.id).toBe(`custom-${now.getTime()}`);
    expect(custom.isCustom).toBe(true);
    expect(custom.createdAt).toBe(now.toISOString());
    expect(custom.updatedAt).toBe(now.toISOString());
    expect(custom.name).toBe('Push day');
  });
});

describe('duplicateOf', () => {
  it('copies a built-in routine as a custom one named "(Copy)"', () => {
    const copy = duplicateOf(WORKOUT_ROUTINES[0], now);
    expect(copy.name).toBe(`${WORKOUT_ROUTINES[0].name} (Copy)`);
    expect(copy.exercises).toEqual(WORKOUT_ROUTINES[0].exercises);
    expect(copy.isCustom).toBe(true);
    expect(copy.id).not.toBe(WORKOUT_ROUTINES[0].id);
  });
});

describe('allRoutines / isCustomRoutine', () => {
  it('lists built-in routines first, not custom, then the user’s own', () => {
    const list = allRoutines(WORKOUT_ROUTINES, [custom]);
    expect(list).toHaveLength(WORKOUT_ROUTINES.length + 1);
    expect(list.slice(0, -1).every((r) => !isCustomRoutine(r))).toBe(true);
    expect(isCustomRoutine(list[list.length - 1])).toBe(true);
  });
});

describe('filterRoutines', () => {
  const list = allRoutines(WORKOUT_ROUTINES, [custom]);

  it('returns everything for All', () => {
    expect(filterRoutines(list, 'All')).toBe(list);
  });

  it('keeps only one category', () => {
    const strength = filterRoutines(list, 'Strength');
    expect(strength.length).toBeGreaterThan(0);
    expect(strength.every((r) => r.category === 'Strength')).toBe(true);
  });

  it('can come back empty', () => {
    expect(filterRoutines(list, 'Cardio')).toEqual([]);
  });
});

describe('searchExercises', () => {
  it('matches names case-insensitively', () => {
    expect(searchExercises(EXERCISES, 'CURL', null).map((e) => e.id)).toEqual(['bicep-curl', 'hammer-curl']);
  });

  it('filters by muscle group', () => {
    expect(searchExercises(EXERCISES, '', 'Core').every((e) => e.muscleGroup === 'Core')).toBe(true);
  });

  it('leaves out exercises already picked', () => {
    const result = searchExercises(EXERCISES, 'curl', 'Arms', [ex('bicep-curl')]);
    expect(result.map((e) => e.id)).toEqual(['hammer-curl']);
  });
});
