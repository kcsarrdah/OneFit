import { dayKey, fillFraction, HISTORY_LIMIT, remaining, upsertHistory } from '@/features/water/lib/hydration';

describe('dayKey', () => {
  it('is the UTC calendar day', () => {
    expect(dayKey(new Date('2026-11-12T23:30:00.000Z'))).toBe('2026-11-12');
  });
});

describe('fillFraction', () => {
  it('is intake over goal', () => {
    expect(fillFraction(500, 2000)).toBe(0.25);
  });

  it('stops at full once the goal is passed', () => {
    expect(fillFraction(2750, 2000)).toBe(1);
  });

  it('is empty for no goal or negative intake', () => {
    expect(fillFraction(500, 0)).toBe(0);
    expect(fillFraction(-10, 2000)).toBe(0);
  });
});

describe('remaining', () => {
  it('never goes below zero', () => {
    expect(remaining(500, 2000)).toBe(1500);
    expect(remaining(2500, 2000)).toBe(0);
  });
});

describe('upsertHistory', () => {
  const entry = (date: string, intake = 0) => ({ date, intake, goal: 2000 });

  it('replaces the same day and keeps newest first', () => {
    const history = [entry('2026-11-11', 1000), entry('2026-11-12', 250)];
    const next = upsertHistory(history, entry('2026-11-12', 500));
    expect(next).toEqual([entry('2026-11-12', 500), entry('2026-11-11', 1000)]);
    expect(history[1].intake).toBe(250);
  });

  it('adds a new day', () => {
    expect(upsertHistory([entry('2026-11-11')], entry('2026-11-12')).map((h) => h.date)).toEqual([
      '2026-11-12',
      '2026-11-11',
    ]);
  });

  it(`keeps at most ${HISTORY_LIMIT} days`, () => {
    const days = Array.from({ length: HISTORY_LIMIT }, (_, i) => entry(`2026-10-${String(i + 1).padStart(2, '0')}`));
    const next = upsertHistory(days, entry('2026-11-12'));
    expect(next).toHaveLength(HISTORY_LIMIT);
    expect(next[0].date).toBe('2026-11-12');
    expect(next.some((h) => h.date === '2026-10-01')).toBe(false);
  });
});
