import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_GOAL, DEFAULT_LOG_AMOUNT, WATER_STORAGE_KEYS as KEYS } from '../constants';
import {
  addIntake,
  dayKey,
  migrateToLocalDays,
  rollover,
  upsertHistory,
  type DayTally,
  type HistoryEntry,
} from '../lib/hydration';

/**
 * @file useHydration.ts
 * @description Today's water intake, the daily goal and the amount one tap
 * logs, kept on the device. A new local day starts from 0, also when the app
 * stays open past midnight; every change is also written to the 30-day
 * history.
 */

async function readHistory(): Promise<HistoryEntry[]> {
  const stored = await AsyncStorage.getItem(KEYS.history);
  return stored ? JSON.parse(stored) : [];
}

async function saveHistory(entry: HistoryEntry) {
  try {
    const history = await readHistory();
    await AsyncStorage.setItem(KEYS.history, JSON.stringify(upsertHistory(history, entry)));
  } catch (error) {
    console.error('Error updating history:', error);
  }
}

/** Moves days stored under UTC keys to local keys, once. Returns the stored day. */
async function migrateDayKeys(storedDate: string | null): Promise<string | null> {
  if ((await AsyncStorage.getItem(KEYS.dayKeys)) === 'local') return storedDate;
  const migrated = migrateToLocalDays(storedDate, await readHistory());
  if (migrated.intakeDate) await AsyncStorage.setItem(KEYS.intakeDate, migrated.intakeDate);
  await AsyncStorage.setItem(KEYS.history, JSON.stringify(migrated.history));
  await AsyncStorage.setItem(KEYS.dayKeys, 'local');
  return migrated.intakeDate;
}

export function useHydration() {
  const [dailyGoal, setDailyGoal] = useState(DEFAULT_GOAL);
  const [tally, setTally] = useState<DayTally>(() => ({ day: dayKey(), intake: 0 }));
  const [logAmount, setLogAmount] = useState(DEFAULT_LOG_AMOUNT);
  const [isLoaded, setIsLoaded] = useState(false);
  // Saves run one after another so two quick changes cannot overwrite each
  // other's history read-modify-write.
  const saveQueue = useRef(Promise.resolve());

  // Load once; start the day from 0 if the stored intake is from another day.
  useEffect(() => {
    const load = async () => {
      try {
        const [goal, amount, storedIntake, storedDate] = await Promise.all([
          AsyncStorage.getItem(KEYS.dailyGoal),
          AsyncStorage.getItem(KEYS.defaultLogAmount),
          AsyncStorage.getItem(KEYS.currentIntake),
          AsyncStorage.getItem(KEYS.intakeDate),
        ]);
        const day = await migrateDayKeys(storedDate);
        setDailyGoal(goal ? JSON.parse(goal) : DEFAULT_GOAL);
        setLogAmount(amount ? JSON.parse(amount) : DEFAULT_LOG_AMOUNT);
        if (day && storedIntake) setTally(rollover({ day, intake: JSON.parse(storedIntake) }, dayKey()));
      } catch (error) {
        console.error('Error loading state from storage:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  // Back in the foreground on a new day: start it from 0.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setTally((current) => rollover(current, dayKey()));
    });
    return () => subscription.remove();
  }, []);

  // Persist every change after the first load.
  useEffect(() => {
    if (!isLoaded) return;
    const save = async () => {
      try {
        await AsyncStorage.setItem(KEYS.currentIntake, JSON.stringify(tally.intake));
        await AsyncStorage.setItem(KEYS.intakeDate, tally.day);
        await saveHistory({ date: tally.day, intake: tally.intake, goal: dailyGoal });
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };
    saveQueue.current = saveQueue.current.then(save);
  }, [tally, dailyGoal, isLoaded]);

  const logWater = useCallback(() => {
    if (logAmount <= 0) {
      console.error('Invalid log amount. Must be positive.');
      return;
    }
    setTally((current) => addIntake(current, dayKey(), logAmount));
  }, [logAmount]);

  const resetWater = useCallback(() => setTally({ day: dayKey(), intake: 0 }), []);

  return { dailyGoal, intake: tally.intake, logAmount, isLoaded, logWater, resetWater };
}
