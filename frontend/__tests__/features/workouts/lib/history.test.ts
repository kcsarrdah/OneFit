import { EXERCISES } from '@/features/workouts/constants';
import {
  buildSavedWorkout,
  formatCompact,
  formatWorkoutDay,
  formatWorkoutSummary,
  overallStats,
  sortByNewest,
  workoutTotals,
} from '@/features/workouts/lib/history';
import type { SavedWorkout, WorkoutExercise } from '@/features/workouts/types';

const bench = EXERCISES.find((e) => e.id === 'bench-press')!;
const entry: WorkoutExercise = {
  id: 'e1',
  exercise: bench,
  sets: [
    { id: 's1', weight: 60, reps: 10, completed: true },
    { id: 's2', weight: 60, reps: 8, completed: true },
    { id: 's3', weight: 60, reps: 8, completed: false },
  ],
};

describe('workoutTotals', () => {
  it('counts all sets, completed sets and completed volume', () => {
    expect(workoutTotals([entry])).toEqual({ totalSets: 3, completedSets: 2, totalVolume: 60 * 10 + 60 * 8 });
  });

  it('is all zeros for an empty workout', () => {
    expect(workoutTotals([])).toEqual({ totalSets: 0, completedSets: 0, totalVolume: 0 });
  });
});

describe('buildSavedWorkout', () => {
  it('stores the exercises, duration, unit, date and totals', () => {
    const now = new Date('2026-11-12T10:00:00.000Z');
    const saved = buildSavedWorkout([entry], 1800, 'kg', now);
    expect(saved.date).toBe(now.toISOString());
    expect(saved.duration).toBe(1800);
    expect(saved.weightUnit).toBe('kg');
    expect(saved.exercises).toEqual([entry]);
    expect(saved.completedSets).toBe(2);
    expect(saved.name).toBe(`Workout ${now.toLocaleDateString()}`);
  });
});

const saved = (id: string, date: string, duration: number, totalVolume: number): SavedWorkout => ({
  id,
  name: id,
  date,
  exercises: [],
  duration,
  totalSets: 0,
  completedSets: 0,
  totalVolume,
  weightUnit: 'kg',
});

describe('sortByNewest', () => {
  it('orders newest first without mutating', () => {
    const history = [saved('old', '2026-01-01', 0, 0), saved('new', '2026-03-01', 0, 0)];
    expect(sortByNewest(history).map((w) => w.id)).toEqual(['new', 'old']);
    expect(history[0].id).toBe('old');
  });
});

describe('overallStats', () => {
  it('sums workouts, seconds and volume', () => {
    const history = [saved('a', '2026-01-01', 600, 1000), saved('b', '2026-01-02', 1200, 500.5)];
    expect(overallStats(history)).toEqual({ totalWorkouts: 2, totalDuration: 1800, totalVolume: 1500.5 });
  });
});

describe('formatting', () => {
  it('keeps big numbers short', () => {
    expect(formatCompact(0)).toBe('0');
    expect(formatCompact(4240.4)).toBe('4,240');
    expect(formatCompact(24_300)).toBe('24.3k');
    expect(formatCompact(120_000)).toBe('120k');
    expect(formatCompact(1_250_000)).toBe('1.3M');
  });

  it("puts a workout's numbers on one line", () => {
    const workout = buildSavedWorkout([entry], 52 * 60 + 10, 'kg');
    expect(formatWorkoutSummary(workout)).toBe('52\u00A0MIN · 2/3\u00A0SETS · 1,080\u00A0KG');
  });

  it('says Today / Yesterday with the time, else the day', () => {
    const now = new Date(2026, 10, 16, 20, 0);
    expect(formatWorkoutDay(new Date(2026, 10, 16, 19, 12).toISOString(), now)).toMatch(/^Today, 7:12\sPM$/);
    expect(formatWorkoutDay(new Date(2026, 10, 15, 18, 5).toISOString(), now)).toMatch(/^Yesterday, 6:05\sPM$/);
    expect(formatWorkoutDay(new Date(2026, 10, 14, 9, 0).toISOString(), now)).toBe('Sat, Nov 14');
    expect(formatWorkoutDay(new Date(2025, 10, 14, 9, 0).toISOString(), now)).toBe('Fri, Nov 14, 2025');
  });
});
