import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fastProgress } from '../lib/format';
import { restoreFast, type StoredTimer } from '../lib/restore';
import type { CompletedFastData } from '../types';

/**
 * @file useFastingTimer.ts
 * @description The running fast: start, stop (hands the finished fast to
 * onComplete and clears the timer), reset. The start time is kept on the
 * device so the timer survives restarts; a fast that reached its goal while
 * the app was closed is completed on launch. It catches up when the app
 * returns to the foreground.
 */

interface UseFastingTimerProps {
  goalDurationSeconds: number;
  onComplete: (fastData: CompletedFastData) => void;
}

const TIMER_STORAGE_KEY = 'fastingTimerState';

export function useFastingTimer({ goalDurationSeconds, onComplete }: UseFastingTimerProps) {
  const [isActive, setIsActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef(AppState.currentState);
  // The load effect must not re-run when the parent passes a new callback.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Load persisted timer state on mount
  useEffect(() => {
    const loadTimerState = async () => {
      try {
        const stored = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
        const storedTimer: StoredTimer | null = stored ? JSON.parse(stored) : null;
        const restored = restoreFast(storedTimer, goalDurationSeconds, Date.now());

        if (restored.kind === 'resume') {
          setStartTime(restored.startTime);
          setElapsedSeconds(restored.elapsedSeconds);
          setIsActive(true);
        } else if (restored.kind === 'complete') {
          // Reached its goal while the app was closed: offer it for saving.
          await AsyncStorage.removeItem(TIMER_STORAGE_KEY);
          onCompleteRef.current(restored.fast);
        }
      } catch (error) {
        console.error('Failed to load timer state:', error);
      }
    };

    loadTimerState();
  }, [goalDurationSeconds]);

  // Save timer state to persistence
  useEffect(() => {
    const saveTimerState = async () => {
      try {
        if (isActive && startTime) {
          const state: StoredTimer = { startTime, goalDurationSeconds };
          await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
        } else {
          await AsyncStorage.removeItem(TIMER_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Failed to save timer state:', error);
      }
    };

    saveTimerState();
  }, [isActive, startTime, goalDurationSeconds]);

  // Hand the finished fast to onComplete and clear the timer, so the screen
  // goes back to "Not started" whether it is then saved or discarded.
  const completeState = useCallback((endTime: number) => {
    if (!startTime) return;
    
    const actualDuration = Math.floor((endTime - startTime) / 1000);
    setIsActive(false);
    setStartTime(null);
    setElapsedSeconds(0);
    
    onComplete({
      startTime,
      endTime,
      actualDurationSeconds: actualDuration,
      goalDurationSeconds
    });
  }, [startTime, goalDurationSeconds, onComplete]);

  // Timer interval
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isActive && startTime) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, startTime]);

  // Background/foreground sync
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // Back in the foreground: catch up on the time spent away. A running
        // fast keeps counting past its goal until the user completes it.
        if (isActive && startTime) {
          setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isActive, startTime]);

  const startFast = useCallback(() => {
    if (isActive) return;
    
    const now = Date.now();
    setStartTime(now);
    setElapsedSeconds(0);
    setIsActive(true);
  }, [isActive]);

  const stopFast = useCallback(() => {
    if (!isActive || !startTime) return;
    
    const now = Date.now();
    completeState(now);
  }, [isActive, startTime, completeState]);

  const resetTimer = useCallback(async () => {
    setIsActive(false);
    setStartTime(null);
    setElapsedSeconds(0);
    
    try {
      await AsyncStorage.removeItem(TIMER_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear timer state:', error);
    }
  }, []);

  const { progressPercentage, remainingSeconds } = fastProgress(elapsedSeconds, goalDurationSeconds);

  return {
    isActive,
    elapsedSeconds,
    remainingSeconds,
    progressPercentage,
    startTime,
    startFast,
    stopFast,
    resetTimer
  };
}