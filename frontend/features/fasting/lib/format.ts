/**
 * @file format.ts
 * @description Pure formatting and progress helpers for the fasting timer.
 */

const pad = (n: number) => String(n).padStart(2, '0');

/** Seconds as "HH:MM:SS", or "MM:SS" under an hour. Negative counts as 0. */
export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = Math.floor(s % 60);
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

/** Seconds as "16h 0m", or "45m" under an hour. */
export function formatHoursMinutes(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

/** Like formatHoursMinutes but drops "0m": "16h", "16h 5m", "45m". */
export function formatFastLength(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  return `${minutes}m`;
}

/** A timestamp as "Nov 12, 9:30 PM", or "Not started" when there is none. */
export function formatClock(timestamp: number | null): string {
  if (!timestamp) return 'Not started';
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
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
