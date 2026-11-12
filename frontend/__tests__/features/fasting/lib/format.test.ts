import {
  expectedEnd,
  fastProgress,
  formatClock,
  formatFastLength,
  formatHoursMinutes,
  formatTime,
} from '@/features/fasting/lib/format';

describe('formatTime', () => {
  it('shows MM:SS under an hour', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(65)).toBe('01:05');
  });

  it('shows HH:MM:SS from an hour', () => {
    expect(formatTime(3661)).toBe('01:01:01');
    expect(formatTime(16 * 3600)).toBe('16:00:00');
  });

  it('treats negative input as zero', () => {
    expect(formatTime(-5)).toBe('00:00');
  });
});

describe('formatHoursMinutes / formatFastLength', () => {
  it('keeps "0m" in the dialog format', () => {
    expect(formatHoursMinutes(16 * 3600)).toBe('16h 0m');
    expect(formatHoursMinutes(16 * 3600 + 300)).toBe('16h 5m');
    expect(formatHoursMinutes(45 * 60)).toBe('45m');
  });

  it('drops "0m" in the toast format', () => {
    expect(formatFastLength(16 * 3600)).toBe('16h');
    expect(formatFastLength(16 * 3600 + 300)).toBe('16h 5m');
    expect(formatFastLength(45 * 60)).toBe('45m');
  });
});

describe('formatClock / expectedEnd', () => {
  it('says "Not started" without a time', () => {
    expect(formatClock(null)).toBe('Not started');
    expect(expectedEnd(null, 3600)).toBeNull();
  });

  it('adds the goal to the start time', () => {
    expect(expectedEnd(1_000, 16 * 3600)).toBe(1_000 + 16 * 3600 * 1000);
  });

  it('formats a timestamp with month, day and time', () => {
    const text = formatClock(new Date(2026, 10, 12, 21, 30).getTime());
    expect(text).toContain('Nov 12');
    expect(text).toMatch(/9:30\sPM/);
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
