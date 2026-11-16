import {
  expectedEnd,
  fastProgress,
  formatDayTime,
  formatFastLength,
  formatHoursClock,
} from '@/features/fasting/lib/format';

describe('formatHoursClock', () => {
  it('shows hours and minutes', () => {
    expect(formatHoursClock(16 * 3600)).toBe('16:00');
    expect(formatHoursClock(7 * 3600 + 42 * 60 + 59)).toBe('7:42');
    expect(formatHoursClock(5 * 60)).toBe('0:05');
  });

  it('treats negative input as zero', () => {
    expect(formatHoursClock(-5)).toBe('0:00');
  });
});

describe('formatFastLength', () => {
  it('drops "0m"', () => {
    expect(formatFastLength(16 * 3600)).toBe('16h');
    expect(formatFastLength(16 * 3600 + 300)).toBe('16h 5m');
    expect(formatFastLength(45 * 60)).toBe('45m');
  });
});

describe('formatDayTime / expectedEnd', () => {
  it('says "Now" without a time', () => {
    expect(formatDayTime(null)).toBe('Now');
    expect(expectedEnd(null, 3600)).toBeNull();
  });

  it('adds the goal to the start time', () => {
    expect(expectedEnd(1_000, 16 * 3600)).toBe(1_000 + 16 * 3600 * 1000);
  });

  it('formats a timestamp as weekday and time', () => {
    const text = formatDayTime(new Date(2026, 10, 17, 12, 30).getTime());
    expect(text).toContain('Tue');
    expect(text).toMatch(/12:30\sPM/);
  });
});

describe('fastProgress', () => {
  it('reports percent done and seconds left', () => {
    expect(fastProgress(3600, 4 * 3600)).toEqual({ progressPercentage: 25, remainingSeconds: 3 * 3600 });
  });

  it('caps at 100% and 0 left', () => {
    expect(fastProgress(5 * 3600, 4 * 3600)).toEqual({ progressPercentage: 100, remainingSeconds: 0 });
  });

  it('is 0% for a zero goal', () => {
    expect(fastProgress(10, 0)).toEqual({ progressPercentage: 0, remainingSeconds: 0 });
  });
});
