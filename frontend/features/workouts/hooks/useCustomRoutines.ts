import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAsyncStorage } from '@/hooks/useAsyncStorage';
import { WORKOUT_ROUTINES } from '../constants';
import { allRoutines, createRoutine, duplicateOf, type AnyRoutine } from '../lib/routines';
import type { CustomRoutine, NewRoutine } from '../types';

/**
 * @file useCustomRoutines.ts
 * @description The built-in routines plus the user's own, stored on the
 * device. Create, duplicate and delete custom routines.
 */

const STORAGE_KEY = 'custom-routines';

export function useCustomRoutines() {
  const [customRoutines, setCustomRoutines] = useState<CustomRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getItem, setItem } = useAsyncStorage();

  const loadCustomRoutines = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await getItem<CustomRoutine[]>(STORAGE_KEY);
      if (stored) setCustomRoutines(stored);
    } catch (error) {
      console.error('Failed to load custom routines:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getItem]);

  useEffect(() => {
    loadCustomRoutines();
  }, [loadCustomRoutines]);

  const saveCustomRoutines = useCallback(async (routines: CustomRoutine[]) => {
    try {
      await setItem(STORAGE_KEY, routines);
      setCustomRoutines(routines);
    } catch (error) {
      console.error('Failed to save custom routines:', error);
      throw error;
    }
  }, [setItem]);

  const routines = useMemo(() => allRoutines(WORKOUT_ROUTINES, customRoutines), [customRoutines]);

  const createCustomRoutine = useCallback(
    (fields: NewRoutine) => saveCustomRoutines([...customRoutines, createRoutine(fields)]),
    [customRoutines, saveCustomRoutines],
  );

  const duplicateRoutine = useCallback(
    (routine: AnyRoutine) => saveCustomRoutines([...customRoutines, duplicateOf(routine)]),
    [customRoutines, saveCustomRoutines],
  );

  const deleteCustomRoutine = useCallback(
    (id: string) => saveCustomRoutines(customRoutines.filter((r) => r.id !== id)),
    [customRoutines, saveCustomRoutines],
  );

  return { routines, isLoading, createCustomRoutine, duplicateRoutine, deleteCustomRoutine };
}
