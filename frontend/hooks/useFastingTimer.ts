import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { STORAGE_KEYS } from '../constants/storageKeys';
import type { FastingTimerHookState, CompletedFast } from '../constants/FastingTypes';

interface UseFastingTimerProps {
  goalDurationSeconds: number;
  onFastStopped: (fastData: CompletedFast) => void;
  onActionRequiresReview: (fastData: CompletedFast) => void;
}

export function useFastingTimer({ 
  goalDurationSeconds, 
  onFastStopped,
  onActionRequiresReview 
}: UseFastingTimerProps) {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [pendingReviewFast, setPendingReviewFast] = useState<CompletedFast | null>(null);
  
  const initialLoadDoneRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  const lastActiveTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);;

  // Load state from AsyncStorage on mount
  useEffect(() => {
    const loadStoredState = async () => {
      try {
        const storedTimerCoreState = await AsyncStorage.getItem(STORAGE_KEYS.TIMER_STATE);
        if (storedTimerCoreState) {
          const parsedState: Pick<FastingTimerHookState, 'startTime' | 'isActive' | 'elapsedSeconds'> = 
            JSON.parse(storedTimerCoreState);
          setStartTime(parsedState.startTime);
          setIsActive(parsedState.isActive);
          setElapsedSeconds(parsedState.elapsedSeconds);
        }

        const storedPendingFast = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_REVIEW_FAST);
        if (storedPendingFast) {
          setPendingReviewFast(JSON.parse(storedPendingFast));
        }
      } catch (error) {
        console.error("Failed to parse stored timer state:", error);
        await AsyncStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
        await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_REVIEW_FAST);
      }
      initialLoadDoneRef.current = true;
    };

    loadStoredState();
  }, []);

  // Save core timer state to AsyncStorage
  useEffect(() => {
    const saveTimerState = async () => {
      if (!initialLoadDoneRef.current) return;
      const timerCoreState: Pick<FastingTimerHookState, 'startTime' | 'isActive' | 'elapsedSeconds'> = 
        { startTime, isActive, elapsedSeconds };
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(timerCoreState));
      } catch (error) {
        console.error("Failed to save timer state:", error);
      }
    };

    saveTimerState();
  }, [startTime, isActive, elapsedSeconds]);

  // Save pendingReviewFast to AsyncStorage
  useEffect(() => {
    const savePendingFast = async () => {
      if (!initialLoadDoneRef.current) return;
      try {
        if (pendingReviewFast) {
          await AsyncStorage.setItem(STORAGE_KEYS.PENDING_REVIEW_FAST, JSON.stringify(pendingReviewFast));
        } else {
          await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_REVIEW_FAST);
        }
      } catch (error) {
        console.error("Failed to save pending fast:", error);
      }
    };

    savePendingFast();
  }, [pendingReviewFast]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground
        if (isActive && startTime) {
          const now = Date.now();
          const timeInBackground = now - (lastActiveTimeRef.current || now);
          const newElapsed = Math.floor((now - startTime) / 1000);
          
          if (newElapsed >= goalDurationSeconds) {
            setElapsedSeconds(goalDurationSeconds);
            internalStopFast(startTime + goalDurationSeconds * 1000);
          } else {
            setElapsedSeconds(newElapsed);
          }
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background
        lastActiveTimeRef.current = Date.now();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [isActive, startTime, goalDurationSeconds]);

  const internalStopFast = useCallback((endTimeOverride?: number) => {
    if (!isActive && !startTime) return;

    setIsActive(false);
    const endTime = endTimeOverride || Date.now();
    const actualDurationSeconds = startTime ? 
      Math.max(0, Math.floor((endTime - startTime) / 1000)) : 
      elapsedSeconds;
    
    setElapsedSeconds(actualDurationSeconds);

    const completedFastData: CompletedFast = {
      id: startTime ? startTime.toString() : Date.now().toString(),
      startTime: startTime || (endTime - actualDurationSeconds * 1000),
      endTime: endTime,
      actualDurationSeconds: actualDurationSeconds,
      goalDurationSeconds: goalDurationSeconds,
    };
    setPendingReviewFast(completedFastData);
    onFastStopped(completedFastData);
  }, [isActive, startTime, goalDurationSeconds, onFastStopped, elapsedSeconds]);

  // Timer interval logic
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isActive && startTime !== null) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const currentElapsed = Math.floor((now - startTime) / 1000);

        if (currentElapsed >= goalDurationSeconds) {
          setElapsedSeconds(goalDurationSeconds);
          internalStopFast(startTime + goalDurationSeconds * 1000);
        } else {
          setElapsedSeconds(currentElapsed);
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, startTime, goalDurationSeconds, internalStopFast]);

  const startFast = useCallback(() => {
    if (pendingReviewFast) {
      onActionRequiresReview(pendingReviewFast);
      return;
    }
    if (isActive) return;

    setElapsedSeconds(0);
    setStartTime(Date.now());
    setIsActive(true);
  }, [isActive, pendingReviewFast, onActionRequiresReview]);

  const stopFast = useCallback(() => {
    if (!isActive) return;
    internalStopFast();
  }, [isActive, internalStopFast]);

  const resetFast = useCallback(async () => {
    setIsActive(false);
    setStartTime(null);
    setElapsedSeconds(0);
    setPendingReviewFast(null);
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_REVIEW_FAST);
    } catch (error) {
      console.error("Failed to clear storage:", error);
    }
  }, []);

  const clearPendingReviewFast = useCallback(() => {
    setPendingReviewFast(null);
  }, []);

  return {
    elapsedSeconds,
    isActive,
    currentStartTime: startTime,
    pendingReviewFast,
    startFast,
    stopFast,
    resetFast,
    clearPendingReviewFast,
  };
}