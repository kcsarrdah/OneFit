/**
 * @file hydration.ts
 * @description Pure helpers for the water tracker: the local day key intake
 * is stored under (and the move from UTC keys), the day rollover, how full the
 * glass is, and the 30-day history.
 */

export interface HistoryEntry {
  date: string;
  intake: number;
  goal: number;
}

/** Days of history kept. */
export const HISTORY_LIMIT = 30;

const pad = (n: number) => String(n).padStart(2, '0');

/** The local calendar day intake is counted for, as "YYYY-MM-DD". */
export function dayKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The UTC calendar day, as days were keyed before local days. */
export function utcDayKey(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/** Today's running total and the day it belongs to. */
export interface DayTally {
  day: string;
  intake: number;
}

/** The tally for `today`: unchanged on the same day, back to 0 on a new one. */
export function rollover(tally: DayTally, today: string): DayTally {
  return tally.day === today ? tally : { day: today, intake: 0 };
}

/** The tally after drinking `amount` ml on `today`, starting a new day if needed. */
export function addIntake(tally: DayTally, today: string, amount: number): DayTally {
  const current = rollover(tally, today);
  return { day: today, intake: current.intake + amount };
}

/**
 * Moves stored UTC day keys to local ones. Only the current day can be
 * matched for sure: if the stored day is today in UTC, it (and its history
 * entry) becomes today's local key, so the intake shown keeps counting. Older
 * days keep their UTC keys. Pure; does not mutate `history`.
 */
export function migrateToLocalDays(
  storedDate: string | null,
  history: HistoryEntry[],
  now: Date = new Date(),
): { intakeDate: string | null; history: HistoryEntry[] } {
  const utcToday = utcDayKey(now);
  const localToday = dayKey(now);
  if (storedDate !== utcToday || utcToday === localToday) return { intakeDate: storedDate, history };

  const todayEntry = history.find((h) => h.date === utcToday);
  const others = history.filter((h) => h.date !== utcToday);
  return {
    intakeDate: localToday,
    history: todayEntry ? upsertHistory(others, { ...todayEntry, date: localToday }) : history,
  };
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
