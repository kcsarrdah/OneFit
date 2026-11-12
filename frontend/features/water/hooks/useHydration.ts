import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_GOAL, DEFAULT_LOG_AMOUNT, WATER_STORAGE_KEYS as KEYS } from '../constants';
import { dayKey, upsertHistory, type HistoryEntry } from '../lib/hydration';

/**
 * @file useHydration.ts
 * @description Today's water intake, the daily goal and the amount one tap
 * logs, kept on the device. A new day starts from 0; every change is also
 * written to the 30-day history.
 */

async function saveHistory(entry: HistoryEntry) {
  try {
    const stored = await AsyncStorage.getItem(KEYS.history);
    const history: HistoryEntry[] = stored ? JSON.parse(stored) : [];
    await AsyncStorage.setItem(KEYS.history, JSON.stringify(upsertHistory(history, entry)));
  } catch (error) {
    console.error('Error updating history:', error);
  }
}

export function useHydration() {
  const [dailyGoal, setDailyGoal] = useState(DEFAULT_GOAL);
  const [intake, setIntake] = useState(0);
  const [logAmount, setLogAmount] = useState(DEFAULT_LOG_AMOUNT);
  const [isLoaded, setIsLoaded] = useState(false);

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
        const today = dayKey();
        const currentGoal = goal ? JSON.parse(goal) : DEFAULT_GOAL;
        setDailyGoal(currentGoal);
        setLogAmount(amount ? JSON.parse(amount) : DEFAULT_LOG_AMOUNT);

        if (storedDate === today && storedIntake) {
          setIntake(JSON.parse(storedIntake));
        } else {
          setIntake(0);
          await AsyncStorage.setItem(KEYS.currentIntake, JSON.stringify(0));
          await AsyncStorage.setItem(KEYS.intakeDate, today);
          await saveHistory({ date: today, intake: 0, goal: currentGoal });
        }
      } catch (error) {
        console.error('Error loading state from storage:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  // Persist every change after the first load.
  useEffect(() => {
    if (!isLoaded) return;
    const save = async () => {
      try {
        await AsyncStorage.setItem(KEYS.currentIntake, JSON.stringify(intake));
        await saveHistory({ date: dayKey(), intake, goal: dailyGoal });
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };
    save();
  }, [intake, dailyGoal, isLoaded]);

  const logWater = useCallback(() => {
    if (logAmount <= 0) {
      console.error('Invalid log amount. Must be positive.');
      return;
    }
    setIntake((current) => current + logAmount);
  }, [logAmount]);

  const resetWater = useCallback(() => setIntake(0), []);

  return { dailyGoal, intake, logAmount, isLoaded, logWater, resetWater };
}
