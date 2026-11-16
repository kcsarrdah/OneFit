/**
 * @file format.ts
 * @description Pure formatting and progress helpers for the fasting timer.
 */

const pad = (n: number) => String(n).padStart(2, '0');

/** A fast's length without a "0m": "16h", "16h 5m", "45m". */
export function formatFastLength(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  return `${minutes}m`;
}

/** Seconds as a clock of hours and minutes: "16:00", "7:42", "0:05". Negative counts as 0. */
export function formatHoursClock(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  return `${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}`;
}

/** A timestamp as weekday and time, "Tue 12:30 PM"; "Now" when there is none. */
export function formatDayTime(timestamp: number | null): string {
  if (!timestamp) return 'Now';
  return new Date(timestamp).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
}

/** When a fast started at `startTime` reaches its goal; null if not started. */
export function expectedEnd(startTime: number | null, goalSeconds: number): number | null {
  return startTime ? startTime + goalSeconds * 1000 : null;
}

/** Percent of the goal done (0-100) and seconds left (never negative). */
export function fastProgress(elapsedSeconds: number, goalSeconds: number) {
  return {
    progressPercentage: goalSeconds > 0 ? Math.min((elapsedSeconds / goalSeconds) * 100, 100) : 0,
    remainingSeconds: Math.max(0, goalSeconds - elapsedSeconds),
  };
}
