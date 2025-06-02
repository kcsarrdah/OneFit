// frontend/hooks/useAsyncStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useCallback, useEffect } from 'react';

/**
 * @file useAsyncStorage.ts
 * @description A custom hook that provides a simple interface for working with AsyncStorage.
 * It includes TypeScript support and handles JSON serialization/deserialization automatically.
 * 
 * Usage:
 * ```typescript
 * const { getItem, setItem, removeItem } = useAsyncStorage();
 * 
 * // Store data
 * await setItem('key', { some: 'data' });
 * 
 * // Retrieve data
 * const data = await getItem('key');
 * 
 * // Remove data
 * await removeItem('key');
 * ```
 */

export function useAsyncStorage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getItem = useCallback(async <T>(key: string): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get item from storage');
      setError(error);
      console.error('Error getting item from AsyncStorage:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setItem = useCallback(async <T>(key: string, value: T): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save item to storage');
      setError(error);
      console.error('Error saving item to AsyncStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (key: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await AsyncStorage.removeItem(key);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to remove item from storage');
      setError(error);
      console.error('Error removing item from AsyncStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await AsyncStorage.clear();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to clear storage');
      setError(error);
      console.error('Error clearing AsyncStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Optional: Add a method to get multiple items at once
  const getMultiple = useCallback(async <T>(keys: string[]): Promise<Record<string, T | null>> => {
    try {
      setIsLoading(true);
      setError(null);
      const values = await AsyncStorage.multiGet(keys);
      return values.reduce((acc, [key, value]) => {
        acc[key] = value ? JSON.parse(value) : null;
        return acc;
      }, {} as Record<string, T | null>);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get multiple items from storage');
      setError(error);
      console.error('Error getting multiple items from AsyncStorage:', error);
      return {};
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Optional: Add a method to set multiple items at once
  const setMultiple = useCallback(async <T>(items: Record<string, T>): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const entries = Object.entries(items).map(([key, value]) => [
        key,
        JSON.stringify(value),
      ] as [string, string]); // Add type assertion here
      await AsyncStorage.multiSet(entries);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to set multiple items in storage');
      setError(error);
      console.error('Error setting multiple items in AsyncStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getItem,
    setItem,
    removeItem,
    clear,
    getMultiple,
    setMultiple,
    isLoading,
    error,
  };
}