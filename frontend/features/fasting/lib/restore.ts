import type { CompletedFastData } from '../types';

/**
 * @file restore.ts
 * @description What to do with a fast found on the device at launch: resume
 * it, complete it because it reached its goal while the app was closed, or
 * ignore it.
 */

/** The running fast as it is stored on the device. */
export interface StoredTimer {
  startTime: number;
  goalDurationSeconds: number;
}

export type RestoredFast =
  | { kind: 'resume'; startTime: number; elapsedSeconds: number }
  | { kind: 'complete'; fast: CompletedFastData }
  | { kind: 'none' };

/**
 * A fast still short of its goal resumes. One that reached its goal while
 * the app was closed is complete, ending exactly at start + goal. A fast
 * started under a different goal is ignored.
 */
export function restoreFast(stored: StoredTimer | null, goalDurationSeconds: number, now: number): RestoredFast {
  if (!stored || stored.goalDurationSeconds !== goalDurationSeconds) return { kind: 'none' };

  const elapsedSeconds = Math.floor((now - stored.startTime) / 1000);
  if (elapsedSeconds < goalDurationSeconds) {
    return { kind: 'resume', startTime: stored.startTime, elapsedSeconds };
  }
  return {
    kind: 'complete',
    fast: {
      startTime: stored.startTime,
      endTime: stored.startTime + goalDurationSeconds * 1000,
      actualDurationSeconds: goalDurationSeconds,
      goalDurationSeconds,
    },
  };
}
