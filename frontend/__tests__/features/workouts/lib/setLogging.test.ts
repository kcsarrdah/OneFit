import {
  completedOnly,
  formatSets,
  formatWeight,
  lastPerformance,
  nextOptions,
  nudge,
  relativeDay,
  startingSet,
  weightStep,
} from '@/features/workouts/lib/setLogging';
import { EXERCISES } from '@/features/workouts/constants';
import type { SavedWorkout, WorkoutExercise, WorkoutSet } from '@/features/workouts/types';

const ex = (id: string) => EXERCISES.find((e) => e.id === id)!;
const set = (weight: number, reps: number, completed = true): WorkoutSet => ({
  id: `${weight}x${reps}-${Math.random()}`,
  weight,
  reps,
  completed,
});
const workout = (date: string, exercises: WorkoutExercise[]): SavedWorkout => ({
  id: date,
  name: date,
  date,
  exercises,
  duration: 3600,
  totalSets: 0,
  completedSets: 0,
  totalVolume: 0,
  weightUnit: 'kg',
});
const entry = (id: string, sets: WorkoutSet[]): WorkoutExercise => ({ id: `we-${id}`, exercise: ex(id), sets });

const history = [
  workout('2026-10-20T18:00:00Z', [entry('bench-press', [set(80, 8), set(80, 7)])]),
  workout('2026-11-09T18:00:00Z', [entry('dumbbell-press', [set(32, 10), set(32, 10), set(32, 9)])]),
  workout('2026-10-01T18:00:00Z', [entry('bench-press', [set(75, 8)])]),
  workout('2026-11-01T18:00:00Z', [entry('chest-fly', [set(14, 12, false)])]),
];

describe('lastPerformance', () => {
  it('takes the newest workout that logged the exercise', () => {
    const last = lastPerformance('bench-press', history)!;
    expect(last.date).toBe('2026-10-20T18:00:00Z');
    expect(formatSets(last.sets)).toBe('80 × 8, 80 × 7');
  });

  it('ignores sets that were never completed', () => {
    expect(lastPerformance('chest-fly', history)).toBeNull();
    expect(lastPerformance('squat', history)).toBeNull();
  });
});

describe('nextOptions', () => {
  it('lists the muscle group by today, then most recent, then by name', () => {
    const session = [entry('incline-bench', [set(60, 8)])];
    const names = nextOptions(EXERCISES, history, session, 'Chest').map((o) => o.exercise.id);
    expect(names).toEqual(['incline-bench', 'dumbbell-press', 'bench-press', 'chest-fly', 'push-ups']);
  });

  it('counts only completed sets as done today', () => {
    const session = [entry('bench-press', [set(80, 8), set(80, 8, false)])];
    const bench = nextOptions(EXERCISES, history, session, null).find((o) => o.exercise.id === 'bench-press')!;
    expect(bench.setsToday).toBe(1);
    expect(bench.last?.sets).toHaveLength(2);
  });
});

describe('starting numbers', () => {
  it('continues from the set just logged today', () => {
    expect(startingSet('Dumbbells', [set(32, 10), set(34, 8)], null)).toEqual({ weight: 34, reps: 8 });
  });

  it('starts from last time when nothing is logged yet', () => {
    expect(startingSet('Barbell', [], lastPerformance('bench-press', history))).toEqual({ weight: 80, reps: 8 });
  });

  it('falls back to a default, with no weight for bodyweight moves', () => {
    expect(startingSet('Barbell', [], null)).toEqual({ weight: 20, reps: 8 });
    expect(startingSet('Bodyweight', [], null)).toEqual({ weight: 0, reps: 8 });
  });
});

describe('nudging', () => {
  it('steps by equipment and unit', () => {
    expect(weightStep('Dumbbells', 'kg')).toBe(2);
    expect(weightStep('Barbell', 'kg')).toBe(2.5);
    expect(weightStep('Machine', 'lbs')).toBe(5);
  });

  it('adds without float noise and clamps', () => {
    expect(nudge(80, 2.5)).toBe(82.5);
    expect(nudge(0.1, 0.2)).toBe(0.3);
    expect(nudge(1, -2.5)).toBe(0);
    expect(nudge(10, 1, 1, 10)).toBe(10);
  });

  it('formats weights without a trailing .0', () => {
    expect(formatWeight(80)).toBe('80');
    expect(formatWeight(82.5)).toBe('82.5');
  });
});

describe('relativeDay', () => {
  const now = new Date(2026, 10, 12, 18); // Thu 12 Nov 2026
  it('names recent days and coarser spans', () => {
    expect(relativeDay(new Date(2026, 10, 12, 7).toISOString(), now)).toBe('today');
    expect(relativeDay(new Date(2026, 10, 11).toISOString(), now)).toBe('yesterday');
    expect(relativeDay(new Date(2026, 10, 9).toISOString(), now)).toBe('Mon');
    expect(relativeDay(new Date(2026, 10, 3).toISOString(), now)).toBe('last week');
    expect(relativeDay(new Date(2026, 9, 22).toISOString(), now)).toBe('3 weeks ago');
    expect(relativeDay(new Date(2026, 9, 1).toISOString(), now)).toBe('last month');
    expect(relativeDay(new Date(2026, 6, 1).toISOString(), now)).toBe('4 months ago');
  });
});

describe('completedOnly', () => {
  it('drops unfinished sets and exercises left empty', () => {
    const result = completedOnly([entry('squat', [set(100, 5), set(100, 5, false)]), entry('plank', [set(0, 60, false)])]);
    expect(result).toHaveLength(1);
    expect(result[0].sets).toHaveLength(1);
  });
});
