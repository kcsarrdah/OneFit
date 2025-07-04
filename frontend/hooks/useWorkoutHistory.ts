import { useState, useCallback, useEffect } from 'react';
import { useAsyncStorage } from './useAsyncStorage';
import { SavedWorkout, WorkoutExercise } from '@/constants/workoutData';

/**
 * @file useWorkoutHistory.ts
 * @description Manages saving and loading workout history
 * 
 * Key Features:
 *   - Save completed workouts
 *   - Load workout history
 *   - Delete workouts
 *   - Calculate workout statistics
 */

export function useWorkoutHistory() {
  const [workoutHistory, setWorkoutHistory] = useState<SavedWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { getItem, setItem } = useAsyncStorage();
  const STORAGE_KEY = 'workout_history';

  // Load workout history on mount
  useEffect(() => {
    loadWorkoutHistory();
  }, []);

  const loadWorkoutHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const savedHistory = await getItem<SavedWorkout[]>(STORAGE_KEY);
      
      if (savedHistory) {
        // Sort by date, newest first
        const sortedHistory = savedHistory.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setWorkoutHistory(sortedHistory);
      } else {
        setWorkoutHistory([]);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load workout history');
      setError(error);
      console.error('Error loading workout history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getItem]);

  const saveWorkout = useCallback(async (
    exercises: WorkoutExercise[],
    duration: number,
    weightUnit: 'kg' | 'lbs',
    workoutName?: string
  ) => {
    try {
      setError(null);
      
      // Calculate workout stats
      const totalSets = exercises.reduce((total, ex) => total + ex.sets.length, 0);
      const completedSets = exercises.reduce((total, ex) => 
        total + ex.sets.filter(set => set.completed).length, 0
      );
      const totalVolume = exercises.reduce((total, ex) => 
        total + ex.sets.reduce((setTotal, set) => 
          set.completed ? setTotal + (set.weight * set.reps) : setTotal, 0
        ), 0
      );

      // Create saved workout object
      const savedWorkout: SavedWorkout = {
        id: `workout_${Date.now()}_${Math.random()}`,
        name: workoutName || `Workout ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString(),
        exercises,
        duration,
        totalSets,
        completedSets,
        totalVolume,
        weightUnit,
      };

      // Add to history
      const updatedHistory = [savedWorkout, ...workoutHistory];
      
      // Save to storage
      await setItem(STORAGE_KEY, updatedHistory);
      
      // Update state
      setWorkoutHistory(updatedHistory);
      
      return savedWorkout;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save workout');
      setError(error);
      console.error('Error saving workout:', error);
      throw error;
    }
  }, [workoutHistory, setItem]);

  const deleteWorkout = useCallback(async (workoutId: string) => {
    try {
      setError(null);
      
      const updatedHistory = workoutHistory.filter(workout => workout.id !== workoutId);
      
      await setItem(STORAGE_KEY, updatedHistory);
      setWorkoutHistory(updatedHistory);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete workout');
      setError(error);
      console.error('Error deleting workout:', error);
      throw error;
    }
  }, [workoutHistory, setItem]);

  const getWorkoutById = useCallback((workoutId: string): SavedWorkout | undefined => {
    return workoutHistory.find(workout => workout.id === workoutId);
  }, [workoutHistory]);

  // Calculate overall statistics
  const overallStats = {
    totalWorkouts: workoutHistory.length,
    totalDuration: workoutHistory.reduce((total, workout) => total + workout.duration, 0),
    totalVolume: workoutHistory.reduce((total, workout) => total + workout.totalVolume, 0),
    averageDuration: workoutHistory.length > 0 
      ? Math.round(workoutHistory.reduce((total, workout) => total + workout.duration, 0) / workoutHistory.length)
      : 0,
    mostFrequentExercises: (() => {
      const exerciseCount: { [key: string]: number } = {};
      workoutHistory.forEach(workout => {
        workout.exercises.forEach(ex => {
          exerciseCount[ex.exercise.name] = (exerciseCount[ex.exercise.name] || 0) + 1;
        });
      });
      return Object.entries(exerciseCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
    })(),
  };

  return {
    // State
    workoutHistory,
    isLoading,
    error,
    overallStats,
    
    // Actions
    saveWorkout,
    deleteWorkout,
    getWorkoutById,
    loadWorkoutHistory,
  };
} 