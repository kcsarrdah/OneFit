import { restoreFast } from '@/features/fasting/lib/restore';

const GOAL = 16 * 3600;
const START = Date.UTC(2026, 10, 15, 20, 0, 0);
const at = (seconds: number) => START + seconds * 1000;

describe('restoreFast', () => {
  it('resumes a fast still short of its goal', () => {
    expect(restoreFast({ startTime: START, goalDurationSeconds: GOAL }, GOAL, at(3600))).toEqual({
      kind: 'resume',
      startTime: START,
      elapsedSeconds: 3600,
    });
  });

  it('completes a fast that reached its goal while the app was closed, ending at start + goal', () => {
    expect(restoreFast({ startTime: START, goalDurationSeconds: GOAL }, GOAL, at(GOAL + 5 * 3600))).toEqual({
      kind: 'complete',
      fast: { startTime: START, endTime: at(GOAL), actualDurationSeconds: GOAL, goalDurationSeconds: GOAL },
    });
  });

  it('completes exactly at the goal', () => {
    expect(restoreFast({ startTime: START, goalDurationSeconds: GOAL }, GOAL, at(GOAL)).kind).toBe('complete');
  });

  it('ignores nothing stored and a fast started under another goal', () => {
    expect(restoreFast(null, GOAL, at(10))).toEqual({ kind: 'none' });
    expect(restoreFast({ startTime: START, goalDurationSeconds: 18 * 3600 }, GOAL, at(10))).toEqual({ kind: 'none' });
  });
});
