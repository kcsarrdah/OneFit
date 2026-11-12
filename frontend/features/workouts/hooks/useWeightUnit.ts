import { useCallback, useEffect, useState } from 'react';
import { useAsyncStorage } from '@/hooks/useAsyncStorage';
import type { WeightUnit } from '../types';

/**
 * @file useWeightUnit.ts
 * @description The user's weight unit (kg or lbs), kept on the device.
 * Defaults to kg.
 */

const STORAGE_KEY = 'workout_weight_unit';

export function useWeightUnit() {
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>('kg');
  const { getItem, setItem } = useAsyncStorage();

  useEffect(() => {
    getItem<WeightUnit>(STORAGE_KEY).then((saved) => {
      if (saved === 'kg' || saved === 'lbs') setWeightUnitState(saved);
    });
  }, [getItem]);

  const setWeightUnit = useCallback((unit: WeightUnit) => {
    setWeightUnitState(unit);
    setItem(STORAGE_KEY, unit);
  }, [setItem]);

  return { weightUnit, setWeightUnit };
}
