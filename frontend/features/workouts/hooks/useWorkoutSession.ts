import { useCallback, useEffect, useState } from 'react';
import { useAsyncStorage } from '@/hooks/useAsyncStorage';
import { routineEntries, withLoggedSet, withoutLastSet } from '../lib/session';
import type { Exercise, WorkoutExercise } from '../types';

/**
 * @file useWorkoutSession.ts
 * @description The workout in progress: its exercises and sets, saved on the
 * device after every change so nothing is lost if the app closes.
 */

const STORAGE_KEY = 'workout_current_session';

interface WorkoutSessionState {
  exercises: WorkoutExercise[];
  sessionId: string;
  startTime: string;
  lastUpdated: string;
}

export function useWorkoutSession() {
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { getItem, setItem, removeItem } = useAsyncStorage();

  const loadSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const saved = await getItem<WorkoutSessionState>(STORAGE_KEY);
      if (saved) {
        setExercises(saved.exercises);
        setSessionId(saved.sessionId);
        setStartTime(saved.startTime);
      } else {
        setSessionId(Date.now().toString());
        setStartTime(new Date().toISOString());
      }
    } catch (error) {
      console.error('Error loading workout session:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getItem]);

  const saveSession = useCallback(async () => {
    const state: WorkoutSessionState = {
      exercises,
      sessionId,
      startTime,
      lastUpdated: new Date().toISOString(),
    };
    await setItem(STORAGE_KEY, state);
  }, [exercises, sessionId, startTime, setItem]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Auto-save whenever the session changes.
  useEffect(() => {
    if (!isLoading && exercises.length > 0) saveSession();
  }, [exercises, isLoading, saveSession]);

  const addExercisesFromRoutine = useCallback((routineExercises: Exercise[]) => {
    setExercises((prev) => [...prev, ...routineEntries(routineExercises)]);
  }, []);

  /**
   * Opens an exercise for logging without placeholder sets. Returns the
   * session entry's id, reusing the entry if the exercise is already in this
   * workout.
   */
  const startExercise = useCallback((exercise: Exercise): string => {
    const existing = exercises.find((ex) => ex.exercise.id === exercise.id);
    if (existing) return existing.id;
    const id = `${Date.now()}_${Math.random()}`;
    setExercises((prev) => [...prev, { id, exercise, sets: [], notes: '' }]);
    return id;
  }, [exercises]);

  /** Records a finished set. */
  const logSet = useCallback((entryId: string, weight: number, reps: number) => {
    setExercises((prev) => withLoggedSet(prev, entryId, weight, reps));
  }, []);

  /** Undoes the most recent set of an exercise. */
  const removeLastSet = useCallback((entryId: string) => {
    setExercises((prev) => withoutLastSet(prev, entryId));
  }, []);

  const resetSession = useCallback(async () => {
    setExercises([]);
    setSessionId(Date.now().toString());
    setStartTime(new Date().toISOString());
    await removeItem(STORAGE_KEY);
  }, [removeItem]);

  return {
    exercises,
    startTime,
    isLoading,
    addExercisesFromRoutine,
    startExercise,
    logSet,
    removeLastSet,
    resetSession,
  };
}
