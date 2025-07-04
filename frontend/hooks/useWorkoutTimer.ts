import { useState, useEffect, useRef, useCallback } from 'react';
import { useAsyncStorage } from './useAsyncStorage';

/**
 * @file useWorkoutTimer.ts
 * @description A workout-specific timer hook that's separate from the fasting timer.
 * Provides start/pause/stop/reset functionality with persistence across app sessions.
 * 
 * Key Features:
 *   - Independent from fasting timer
 *   - Persists timer state during active workouts
 *   - Auto-saves progress to prevent data loss
 *   - Clean separation of concerns
 * 
 * Usage:
 *   const { duration, isActive, start, pause, stop, reset } = useWorkoutTimer();
 */

interface WorkoutTimerState {
  duration: number;
  isActive: boolean;
  startTime?: string; // ISO string for calculating elapsed time after app restart
}

export function useWorkoutTimer() {
  const [duration, setDuration] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const { getItem, setItem, removeItem } = useAsyncStorage();

  const STORAGE_KEY = 'workout_timer_state';

  // Load persisted timer state on mount
  useEffect(() => {
    loadTimerState();
  }, []);

  // Save timer state whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveTimerState();
    }
  }, [duration, isActive, isLoading]);

  // Handle timer interval
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const loadTimerState = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const savedState = await getItem<WorkoutTimerState>(STORAGE_KEY);
      
      if (savedState) {
        // If timer was active, calculate elapsed time since app was closed
        if (savedState.isActive && savedState.startTime) {
          const startTime = new Date(savedState.startTime);
          const now = new Date();
          const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
          const totalDuration = savedState.duration + elapsedSeconds;
          
          setDuration(totalDuration);
          setIsActive(true);
          startTimeRef.current = startTime;
        } else {
          setDuration(savedState.duration);
          setIsActive(savedState.isActive);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load timer state');
      setError(error);
      console.error('Error loading workout timer state:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getItem]);

  const saveTimerState = useCallback(async () => {
    try {
      const state: WorkoutTimerState = {
        duration,
        isActive,
        startTime: startTimeRef.current?.toISOString(),
      };
      
      await setItem(STORAGE_KEY, state);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save timer state');
      setError(error);
      console.error('Error saving workout timer state:', error);
    }
  }, [duration, isActive, setItem]);

  const start = useCallback(() => {
    setIsActive(true);
    startTimeRef.current = new Date();
    setError(null);
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
    startTimeRef.current = null;
    setError(null);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
    setDuration(0);
    startTimeRef.current = null;
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
    setDuration(0);
    startTimeRef.current = null;
    setError(null);
  }, []);

  // Clear persisted state when timer is stopped/reset
  useEffect(() => {
    if (duration === 0 && !isActive) {
      removeItem(STORAGE_KEY).catch(console.error);
    }
  }, [duration, isActive, removeItem]);

  // Format duration for display
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    duration,
    isActive,
    isLoading,
    error,
    
    // Actions
    start,
    pause,
    stop,
    reset,
    
    // Utilities
    formatTime,
    formattedTime: formatTime(duration),
  };
}