/**
 * @file types.ts
 * @description Fasting types.
 */

/** A fast that has just been stopped or completed, awaiting save or discard. */
export interface CompletedFastData {
  startTime: number;
  endTime: number;
  actualDurationSeconds: number;
  /** The planned goal when the fast was started. */
  goalDurationSeconds: number;
}
