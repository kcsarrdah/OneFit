import { useState, useEffect, useCallback } from 'react';
import { useAsyncStorage } from './useAsyncStorage';

/**
 * @file useWeightUnit.ts
 * @description Manages user's weight unit preference (kg/lbs) with AsyncStorage persistence.
 * 
 * Key Features:
 *   - Persists preference across app sessions
 *   - Provides conversion utilities
 *   - Loading states for smooth UX
 *   - Error handling
 * 
 * Usage:
 *   const { weightUnit, toggleWeightUnit, setWeightUnit, convertWeight } = useWeightUnit();
 */

export type WeightUnit = 'kg' | 'lbs';

interface WeightUnitHook {
  weightUnit: WeightUnit;
  isLoading: boolean;
  error: Error | null;
  toggleWeightUnit: () => void;
  setWeightUnit: (unit: WeightUnit) => void;
  convertWeight: (weight: number, fromUnit: WeightUnit, toUnit: WeightUnit) => number;
  formatWeight: (weight: number, unit?: WeightUnit) => string;
}

export function useWeightUnit(): WeightUnitHook {
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>('kg');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { getItem, setItem } = useAsyncStorage();
  const STORAGE_KEY = 'workout_weight_unit';

  // Load saved preference on mount
  useEffect(() => {
    loadWeightUnit();
  }, []);

  const loadWeightUnit = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const savedUnit = await getItem<WeightUnit>(STORAGE_KEY);
      if (savedUnit && (savedUnit === 'kg' || savedUnit === 'lbs')) {
        setWeightUnitState(savedUnit);
      } else {
        // Default to kg if no saved preference
        setWeightUnitState('kg');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load weight unit preference');
      setError(error);
      console.error('Error loading weight unit:', error);
      // Fallback to default
      setWeightUnitState('kg');
    } finally {
      setIsLoading(false);
    }
  }, [getItem]);

  const saveWeightUnit = useCallback(async (unit: WeightUnit) => {
    try {
      await setItem(STORAGE_KEY, unit);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save weight unit preference');
      setError(error);
      console.error('Error saving weight unit:', error);
    }
  }, [setItem]);

  const setWeightUnit = useCallback((unit: WeightUnit) => {
    setWeightUnitState(unit);
    saveWeightUnit(unit);
    setError(null);
  }, [saveWeightUnit]);

  const toggleWeightUnit = useCallback(() => {
    const newUnit = weightUnit === 'kg' ? 'lbs' : 'kg';
    setWeightUnit(newUnit);
  }, [weightUnit, setWeightUnit]);

  // Weight conversion utilities
  const convertWeight = useCallback((weight: number, fromUnit: WeightUnit, toUnit: WeightUnit): number => {
    if (fromUnit === toUnit) return weight;
    
    if (fromUnit === 'kg' && toUnit === 'lbs') {
      return Math.round(weight * 2.20462 * 10) / 10; // Round to 1 decimal
    } else if (fromUnit === 'lbs' && toUnit === 'kg') {
      return Math.round(weight / 2.20462 * 10) / 10; // Round to 1 decimal
    }
    
    return weight;
  }, []);

  const formatWeight = useCallback((weight: number, unit?: WeightUnit): string => {
    const displayUnit = unit || weightUnit;
    const formattedWeight = weight % 1 === 0 ? weight.toString() : weight.toFixed(1);
    return `${formattedWeight} ${displayUnit}`;
  }, [weightUnit]);

  return {
    weightUnit,
    isLoading,
    error,
    toggleWeightUnit,
    setWeightUnit,
    convertWeight,
    formatWeight,
  };
}