import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAsyncStorage } from '@/hooks/useAsyncStorage';
import { buildSavedWorkout, overallStats, sortByNewest } from '../lib/history';
import type { SavedWorkout, WeightUnit, WorkoutExercise } from '../types';

/**
 * @file useWorkoutHistory.ts
 * @description Saved workouts on the device, newest first: save a finished
 * workout, delete one, and the overall totals.
 */

const STORAGE_KEY = 'workout_history';

export function useWorkoutHistory() {
  const [workoutHistory, setWorkoutHistory] = useState<SavedWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getItem, setItem } = useAsyncStorage();

  const loadWorkoutHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const saved = await getItem<SavedWorkout[]>(STORAGE_KEY);
      setWorkoutHistory(saved ? sortByNewest(saved) : []);
    } catch (error) {
      console.error('Error loading workout history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getItem]);

  useEffect(() => {
    loadWorkoutHistory();
  }, [loadWorkoutHistory]);

  const saveWorkout = useCallback(async (exercises: WorkoutExercise[], duration: number, weightUnit: WeightUnit) => {
    const saved = buildSavedWorkout(exercises, duration, weightUnit);
    const updated = [saved, ...workoutHistory];
    await setItem(STORAGE_KEY, updated);
    setWorkoutHistory(updated);
    return saved;
  }, [workoutHistory, setItem]);

  const deleteWorkout = useCallback(async (workoutId: string) => {
    const updated = workoutHistory.filter((workout) => workout.id !== workoutId);
    await setItem(STORAGE_KEY, updated);
    setWorkoutHistory(updated);
  }, [workoutHistory, setItem]);

  const stats = useMemo(() => overallStats(workoutHistory), [workoutHistory]);

  return { workoutHistory, isLoading, overallStats: stats, saveWorkout, deleteWorkout };
}
