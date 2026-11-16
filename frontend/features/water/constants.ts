/**
 * @file constants.ts
 * @description Water tracker defaults and the AsyncStorage keys it uses.
 */

export const DEFAULT_GOAL = 2000; // ml
export const DEFAULT_LOG_AMOUNT = 250; // ml

const STORAGE_PREFIX = 'aquaViz_';

export const WATER_STORAGE_KEYS = {
  dailyGoal: `${STORAGE_PREFIX}dailyGoal`,
  defaultLogAmount: `${STORAGE_PREFIX}defaultLogAmount`,
  currentIntake: `${STORAGE_PREFIX}currentIntake`,
  intakeDate: `${STORAGE_PREFIX}intakeDate`,
  history: `${STORAGE_PREFIX}hydrationHistory`,
  /** 'local' once day keys have been moved from UTC to local dates. */
  dayKeys: `${STORAGE_PREFIX}dayKeys`,
} as const;
