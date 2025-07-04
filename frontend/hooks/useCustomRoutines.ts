import { useState, useCallback, useEffect } from 'react';
import { useAsyncStorage } from './useAsyncStorage';
import { WorkoutRoutine, Exercise, WORKOUT_ROUTINES } from '@/constants/workoutData';

/**
 * @file useCustomRoutines.ts
 * @description Manages custom workout routines with CRUD operations
 * 
 * Key Features:
 *   - Create custom routines
 *   - Edit existing routines
 *   - Delete routines
 *   - Load both pre-made and custom routines
 *   - Duplicate routines for customization
 */

export interface CustomRoutine extends WorkoutRoutine {
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useCustomRoutines() {
  const [customRoutines, setCustomRoutines] = useState<CustomRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getItem, setItem } = useAsyncStorage();

  // Load custom routines on mount
  useEffect(() => {
    loadCustomRoutines();
  }, []);

  const loadCustomRoutines = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await getItem<CustomRoutine[]>('custom-routines');
      if (stored) {
        setCustomRoutines(stored);
      }
    } catch (error) {
      console.error('Failed to load custom routines:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getItem]);

  const saveCustomRoutines = useCallback(async (routines: CustomRoutine[]) => {
    try {
      await setItem('custom-routines', routines);
      setCustomRoutines(routines);
    } catch (error) {
      console.error('Failed to save custom routines:', error);
      throw error;
    }
  }, [setItem]);

  // Get all routines (pre-made + custom)
  const getAllRoutines = useCallback((): (WorkoutRoutine | CustomRoutine)[] => {
    const preMadeRoutines = WORKOUT_ROUTINES.map(routine => ({
      ...routine,
      isCustom: false
    }));
    return [...preMadeRoutines, ...customRoutines];
  }, [customRoutines]);

  // Create a new custom routine
  const createCustomRoutine = useCallback(async (
    name: string,
    description: string,
    exercises: Exercise[],
    estimatedDuration: number,
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
    category: 'Strength' | 'Cardio' | 'HIIT' | 'Full Body' | 'Upper Body' | 'Lower Body'
  ): Promise<CustomRoutine> => {
    const newRoutine: CustomRoutine = {
      id: `custom-${Date.now()}`,
      name,
      description,
      exercises,
      estimatedDuration,
      difficulty,
      category,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedRoutines = [...customRoutines, newRoutine];
    await saveCustomRoutines(updatedRoutines);
    return newRoutine;
  }, [customRoutines, saveCustomRoutines]);

  // Edit an existing custom routine
  const editCustomRoutine = useCallback(async (
    id: string,
    updates: Partial<Omit<CustomRoutine, 'id' | 'isCustom' | 'createdAt'>>
  ): Promise<CustomRoutine> => {
    const routineIndex = customRoutines.findIndex(r => r.id === id);
    if (routineIndex === -1) {
      throw new Error('Routine not found');
    }

    const updatedRoutine: CustomRoutine = {
      ...customRoutines[routineIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    const updatedRoutines = [...customRoutines];
    updatedRoutines[routineIndex] = updatedRoutine;
    await saveCustomRoutines(updatedRoutines);
    return updatedRoutine;
  }, [customRoutines, saveCustomRoutines]);

  // Delete a custom routine
  const deleteCustomRoutine = useCallback(async (id: string): Promise<void> => {
    const updatedRoutines = customRoutines.filter(r => r.id !== id);
    await saveCustomRoutines(updatedRoutines);
  }, [customRoutines, saveCustomRoutines]);

  // Duplicate a routine (pre-made or custom) to create a custom version
  const duplicateRoutine = useCallback(async (
    originalRoutine: WorkoutRoutine | CustomRoutine,
    newName?: string
  ): Promise<CustomRoutine> => {
    const duplicatedRoutine: CustomRoutine = {
      ...originalRoutine,
      id: `custom-${Date.now()}`,
      name: newName || `${originalRoutine.name} (Copy)`,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedRoutines = [...customRoutines, duplicatedRoutine];
    await saveCustomRoutines(updatedRoutines);
    return duplicatedRoutine;
  }, [customRoutines, saveCustomRoutines]);

  // Get routine by ID (searches both pre-made and custom)
  const getRoutineById = useCallback((id: string): WorkoutRoutine | CustomRoutine | undefined => {
    // Check pre-made routines first
    const preMadeRoutine = WORKOUT_ROUTINES.find(r => r.id === id);
    if (preMadeRoutine) {
      return { ...preMadeRoutine, isCustom: false };
    }
    
    // Check custom routines
    return customRoutines.find(r => r.id === id);
  }, [customRoutines]);

  return {
    customRoutines,
    isLoading,
    getAllRoutines,
    createCustomRoutine,
    editCustomRoutine,
    deleteCustomRoutine,
    duplicateRoutine,
    getRoutineById,
    refresh: loadCustomRoutines
  };
} 