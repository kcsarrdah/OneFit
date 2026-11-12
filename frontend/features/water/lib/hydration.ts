/**
 * @file hydration.ts
 * @description Pure helpers for the water tracker: the day key intake is
 * stored under, how full the glass is, and the 30-day history.
 */

export interface HistoryEntry {
  date: string;
  intake: number;
  goal: number;
}

/** Days of history kept. */
export const HISTORY_LIMIT = 30;

/** The day intake is counted for, as "YYYY-MM-DD" (UTC, as stored so far). */
export function dayKey(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/** How full the screen is: 0 (empty) to 1 (goal reached or passed). */
export function fillFraction(intake: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(Math.max(intake / goal, 0), 1);
}

/** Millilitres still to drink today, never negative. */
export function remaining(intake: number, goal: number): number {
  return Math.max(0, goal - intake);
}

/**
 * The history with `entry` replacing that day's entry (or added), newest
 * first, at most HISTORY_LIMIT days. Does not mutate `history`.
 */
export function upsertHistory(history: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  const others = history.filter((h) => h.date !== entry.date);
  return [...others, entry]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, HISTORY_LIMIT);
}
