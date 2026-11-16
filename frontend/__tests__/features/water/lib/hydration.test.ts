import {
  addIntake,
  dayKey,
  fillFraction,
  HISTORY_LIMIT,
  migrateToLocalDays,
  remaining,
  rollover,
  upsertHistory,
  utcDayKey,
} from '@/features/water/lib/hydration';

// Local times below use the Date(y, m, d, h) constructor, so they hold in any
// time zone the suite runs in.

describe('dayKey', () => {
  it('is the local calendar day, even late at night', () => {
    expect(dayKey(new Date(2026, 10, 12, 23, 30))).toBe('2026-11-12');
    expect(dayKey(new Date(2026, 10, 13, 0, 5))).toBe('2026-11-13');
  });

  it('pads month and day', () => {
    expect(dayKey(new Date(2026, 0, 5, 12))).toBe('2026-01-05');
  });
});

describe('utcDayKey', () => {
  it('is the UTC calendar day', () => {
    expect(utcDayKey(new Date('2026-11-12T23:30:00.000Z'))).toBe('2026-11-12');
  });
});

describe('rollover and addIntake', () => {
  const today = { day: '2026-11-12', intake: 750 };

  it('keeps the tally on the same day', () => {
    expect(rollover(today, '2026-11-12')).toBe(today);
    expect(addIntake(today, '2026-11-12', 250)).toEqual({ day: '2026-11-12', intake: 1000 });
  });

  it('starts a new day from 0 when the app stayed open past midnight', () => {
    expect(rollover(today, '2026-11-13')).toEqual({ day: '2026-11-13', intake: 0 });
    expect(addIntake(today, '2026-11-13', 250)).toEqual({ day: '2026-11-13', intake: 250 });
  });
});

describe('migrateToLocalDays', () => {
  const entry = (date: string, intake = 0) => ({ date, intake, goal: 2000 });

  // A moment whose UTC day differs from its local day, in whatever zone the
  // suite runs in; null in UTC itself.
  const mismatched = [new Date(2026, 10, 12, 0, 30), new Date(2026, 10, 12, 23, 30)].find(
    (d) => utcDayKey(d) !== dayKey(d),
  );

  it('changes nothing when the UTC and local days agree', () => {
    const now = new Date(2026, 10, 12, 12);
    const history = [entry(utcDayKey(now), 500)];
    const expected = utcDayKey(now) === dayKey(now) ? utcDayKey(now) : dayKey(now);
    expect(migrateToLocalDays(utcDayKey(now), history, now).intakeDate).toBe(expected);
  });

  it('leaves an older stored day alone (the load resets it anyway)', () => {
    const now = new Date(2026, 10, 12, 12);
    const history = [entry('2026-11-01', 900)];
    expect(migrateToLocalDays('2026-11-01', history, now)).toEqual({ intakeDate: '2026-11-01', history });
  });

  it('handles nothing stored', () => {
    expect(migrateToLocalDays(null, [], new Date(2026, 10, 12, 12))).toEqual({ intakeDate: null, history: [] });
  });

  (mismatched ? it : it.skip)("moves today's UTC key and history entry to the local day", () => {
    const now = mismatched as Date;
    const utc = utcDayKey(now);
    const local = dayKey(now);
    const history = [entry(utc, 1250), entry('2026-11-01', 900)];
    const result = migrateToLocalDays(utc, history, now);
    expect(result.intakeDate).toBe(local);
    expect(result.history.find((h) => h.date === local)?.intake).toBe(1250);
    expect(result.history.some((h) => h.date === utc)).toBe(false);
    expect(result.history.some((h) => h.date === '2026-11-01')).toBe(true);
    expect(history[0].date).toBe(utc);
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
