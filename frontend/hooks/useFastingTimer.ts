// frontend/hooks/useFastingTimer.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UseFastingTimerProps {
  goalDurationSeconds: number;
  onComplete: (fastData: {
    startTime: number;
    endTime: number;
    actualDurationSeconds: number;
    goalDurationSeconds: number;
  }) => void;
}

interface TimerState {
  startTime: number;
  goalDurationSeconds: number;
}

const TIMER_STORAGE_KEY = 'fastingTimerState';

export function useFastingTimer({ goalDurationSeconds, onComplete }: UseFastingTimerProps) {
  const [isActive, setIsActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  const intervalRef = useRef<number | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // Load persisted timer state on mount
  useEffect(() => {
    const loadTimerState = async () => {
      try {
        const stored = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
        if (stored) {
          const { startTime: storedStartTime, goalDurationSeconds: storedGoal }: TimerState = JSON.parse(stored);
          
          // Only restore if goal matches current goal
          if (storedGoal === goalDurationSeconds) {
            const now = Date.now();
            const elapsed = Math.floor((now - storedStartTime) / 1000);
            
            if (elapsed < goalDurationSeconds) {
              setStartTime(storedStartTime);
              setElapsedSeconds(elapsed);
              setIsActive(true);
            } else {
              // Timer completed while app was closed
              await AsyncStorage.removeItem(TIMER_STORAGE_KEY);
            }
          }
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
          const state: TimerState = { startTime, goalDurationSeconds };
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

  // Complete the fast - centralized logic
  const completeState = useCallback((endTime: number) => {
    if (!startTime) return;
    
    const actualDuration = Math.floor((endTime - startTime) / 1000);
    setIsActive(false);
    setElapsedSeconds(actualDuration);
    
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
        // App came to foreground - recalculate elapsed time
        if (isActive && startTime) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setElapsedSeconds(Math.min(elapsed, goalDurationSeconds));
          
          // If completed while backgrounded, let interval handle it on next tick
          if (elapsed >= goalDurationSeconds) {
            setElapsedSeconds(goalDurationSeconds);
          }
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isActive, startTime, goalDurationSeconds]);

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

  // Calculated values
  const progressPercentage = goalDurationSeconds > 0 
    ? Math.min((elapsedSeconds / goalDurationSeconds) * 100, 100) 
    : 0;
  
  const remainingSeconds = Math.max(0, goalDurationSeconds - elapsedSeconds);

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