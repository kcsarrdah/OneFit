import { EXERCISES } from '@/features/workouts/constants';
import {
  ROUTINE_DEFAULT_SET,
  routineEntries,
  setsLogged,
  withLoggedSet,
  withoutLastSet,
} from '@/features/workouts/lib/session';

const [squat, bench] = EXERCISES.filter((e) => e.id === 'squat' || e.id === 'bench-press');

describe('routineEntries', () => {
  it('gives each exercise three placeholder sets, not done', () => {
    const entries = routineEntries([squat, bench], 1000);
    expect(entries).toHaveLength(2);
    for (const entry of entries) {
      expect(entry.sets).toHaveLength(3);
      expect(entry.sets.every((s) => !s.completed)).toBe(true);
      expect(entry.sets[0]).toMatchObject(ROUTINE_DEFAULT_SET);
    }
    expect(entries[0].exercise).toBe(squat);
    expect(entries[0].sets.map((s) => s.id)).toEqual(['set_1000_1', 'set_1000_2', 'set_1000_3']);
    expect(entries[1].sets[0].id).toBe('set_1001_1');
  });
});

describe('logging and undo', () => {
  const start = [
    { id: 'a', exercise: squat, sets: [] },
    { id: 'b', exercise: bench, sets: [] },
  ];

  it('appends a completed set to one entry only', () => {
    const next = withLoggedSet(start, 'a', 100, 5);
    expect(next[0].sets).toHaveLength(1);
    expect(next[0].sets[0]).toMatchObject({ weight: 100, reps: 5, completed: true });
    expect(next[1].sets).toHaveLength(0);
    expect(start[0].sets).toHaveLength(0);
  });

  it('removes the most recent set', () => {
    const two = withLoggedSet(withLoggedSet(start, 'a', 100, 5), 'a', 105, 3);
    const undone = withoutLastSet(two, 'a');
    expect(undone[0].sets.map((s) => s.weight)).toEqual([100]);
  });

  it('counts completed sets across the session', () => {
    const logged = withLoggedSet(withLoggedSet(start, 'a', 100, 5), 'b', 60, 10);
    expect(setsLogged(logged)).toBe(2);
    expect(setsLogged(routineEntries([squat]))).toBe(0);
  });
});
