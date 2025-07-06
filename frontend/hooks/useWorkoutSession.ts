import { useState, useCallback, useEffect } from 'react';
import { useAsyncStorage } from './useAsyncStorage';
import { WheelPicker } from '@/components/ui/WheelPicker';

/**
 * @file useWorkoutSession.ts
 * @description Manages the current workout session state including exercises, sets, and progress.
 * 
 * Key Features:
 *   - Manages current workout exercises and sets
 *   - Auto-saves session to prevent data loss
 *   - Calculates workout statistics
 *   - Provides CRUD operations for exercises and sets
 * 
 * Usage:
 *   const {
 *     exercises,
 *     addExercise,
 *     removeExercise,
 *     updateExerciseSets,
 *     resetSession,
 *     workoutStats
 *   } = useWorkoutSession();
 */

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment?: string;
  instructions?: string;
}

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutStats {
  totalExercises: number;
  totalSets: number;
  completedSets: number;
  totalVolume: number;
  completionPercentage: number;
}

interface WorkoutSessionState {
  exercises: WorkoutExercise[];
  sessionId: string;
  startTime: string;
  lastUpdated: string;
}

export function useWorkoutSession() {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { getItem, setItem, removeItem } = useAsyncStorage();
  const STORAGE_KEY = 'workout_current_session';

  // Load existing session on mount
  useEffect(() => {
    loadSession();
  }, []);

  // Auto-save session whenever exercises change
  useEffect(() => {
    if (!isLoading && exercises.length > 0) {
      saveSession();
    }
  }, [exercises, isLoading]);

  const loadSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const savedSession = await getItem<WorkoutSessionState>(STORAGE_KEY);
      
      if (savedSession) {
        setExercises(savedSession.exercises);
        setSessionId(savedSession.sessionId);
        setStartTime(savedSession.startTime);
      } else {
        // Initialize new session
        const newSessionId = Date.now().toString();
        const now = new Date().toISOString();
        setSessionId(newSessionId);
        setStartTime(now);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load workout session');
      setError(error);
      console.error('Error loading workout session:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getItem]);

  const saveSession = useCallback(async () => {
    try {
      const sessionState: WorkoutSessionState = {
        exercises,
        sessionId,
        startTime,
        lastUpdated: new Date().toISOString(),
      };
      
      await setItem(STORAGE_KEY, sessionState);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save workout session');
      setError(error);
      console.error('Error saving workout session:', error);
    }
  }, [exercises, sessionId, startTime, setItem]);

  // Update the addExercise function to add 3 default sets with integer weights
  const addExercise = useCallback((exercise: Exercise) => {
    // Create 3 default sets with integer weights
    const defaultSets: WorkoutSet[] = [
      {
        id: `set_${Date.now()}_1`,
        weight: 20, // Start with 20kg/lbs as default
        reps: 8,
        completed: false,
      },
      {
        id: `set_${Date.now()}_2`,
        weight: 20,
        reps: 8,
        completed: false,
      },
      {
        id: `set_${Date.now()}_3`,
        weight: 20,
        reps: 8,
        completed: false,
      },
    ];

    const newWorkoutExercise: WorkoutExercise = {
      id: `${Date.now()}_${Math.random()}`,
      exercise,
      sets: defaultSets,
      notes: '',
    };
    
    setExercises(prev => [...prev, newWorkoutExercise]);
    setError(null);
  }, []);

  const addExercisesFromRoutine = useCallback((exercises: Exercise[]) => {
    const newWorkoutExercises: WorkoutExercise[] = exercises.map((exercise, index) => {
      const baseTime = Date.now() + index; // Ensure unique IDs
      
      // Create 3 default sets with integer weights
      const defaultSets: WorkoutSet[] = [
        {
          id: `set_${baseTime}_1`,
          weight: 20, // Start with 20kg/lbs as default
          reps: 8,
          completed: false,
        },
        {
          id: `set_${baseTime}_2`,
          weight: 20,
          reps: 8,
          completed: false,
        },
        {
          id: `set_${baseTime}_3`,
          weight: 20,
          reps: 8,
          completed: false,
        },
      ];

      return {
        id: `${baseTime}_${Math.random()}`,
        exercise,
        sets: defaultSets,
        notes: '',
      };
    });
    
    setExercises(prev => [...prev, ...newWorkoutExercises]);
    setError(null);
  }, []);

  const removeExercise = useCallback((exerciseId: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
    setError(null);
  }, []);

  const updateExerciseSets = useCallback((exerciseId: string, sets: WorkoutSet[]) => {
    setExercises(prev =>
      prev.map(ex => ex.id === exerciseId ? { ...ex, sets } : ex)
    );
    setError(null);
  }, []);

  const updateExerciseNotes = useCallback((exerciseId: string, notes: string) => {
    setExercises(prev =>
      prev.map(ex => ex.id === exerciseId ? { ...ex, notes } : ex)
    );
    setError(null);
  }, []);

  const addSetToExercise = useCallback((exerciseId: string, weight: number, reps: number) => {
    const newSet: WorkoutSet = {
      id: `set_${Date.now()}_${Math.random()}`,
      weight,
      reps,
      completed: false,
    };

    setExercises(prev =>
      prev.map(ex =>
        ex.id === exerciseId
          ? { ...ex, sets: [...ex.sets, newSet] }
          : ex
      )
    );
    setError(null);
  }, []);

  const updateSet = useCallback((exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => {
    setExercises(prev =>
      prev.map(ex =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map(set =>
                set.id === setId ? { ...set, ...updates } : set
              ),
            }
          : ex
      )
    );
    setError(null);
  }, []);

  const removeSet = useCallback((exerciseId: string, setId: string) => {
    setExercises(prev =>
      prev.map(ex =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter(set => set.id !== setId) }
          : ex
      )
    );
    setError(null);
  }, []);

  const resetSession = useCallback(async () => {
    try {
      setExercises([]);
      setSessionId(Date.now().toString());
      setStartTime(new Date().toISOString());
      await removeItem(STORAGE_KEY);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to reset workout session');
      setError(error);
      console.error('Error resetting workout session:', error);
    }
  }, [removeItem]);

  // Calculate workout statistics
  const workoutStats: WorkoutStats = {
    totalExercises: exercises.length,
    totalSets: exercises.reduce((total, ex) => total + ex.sets.length, 0),
    completedSets: exercises.reduce((total, ex) => 
      total + ex.sets.filter(set => set.completed).length, 0
    ),
    totalVolume: exercises.reduce((total, ex) => 
      total + ex.sets.reduce((setTotal, set) => 
        set.completed ? setTotal + (set.weight * set.reps) : setTotal, 0
      ), 0
    ),
    completionPercentage: (() => {
      const totalSets = exercises.reduce((total, ex) => total + ex.sets.length, 0);
      const completedSets = exercises.reduce((total, ex) => 
        total + ex.sets.filter(set => set.completed).length, 0
      );
      return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
    })(),
  };

  const hasActiveWorkout = exercises.length > 0;
  const canSaveWorkout = exercises.length > 0 && workoutStats.completedSets > 0;

  return {
    // State
    exercises,
    sessionId,
    startTime,
    isLoading,
    error,
    workoutStats,
    hasActiveWorkout,
    canSaveWorkout,
    
    // Exercise operations
    addExercise,
    addExercisesFromRoutine,
    removeExercise,
    updateExerciseNotes,
    
    // Set operations
    updateExerciseSets,
    addSetToExercise,
    updateSet,
    removeSet,
    
    // Session operations
    resetSession,
  };
}