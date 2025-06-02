/**
 * @file storageKeys.ts
 * @description Constants for AsyncStorage keys used throughout the app
 */

export const STORAGE_KEYS = {
    // Timer related
    TIMER_STATE: '@OneFit/timerState',
    PENDING_REVIEW_FAST: '@OneFit/pendingReviewFast',
    
    // App settings
    APP_SETTINGS: '@OneFit/appSettings',
    
    // Fasting history
    FASTING_HISTORY: '@OneFit/fastingHistory',
  } as const;
  
  // Type for the storage keys
  export type StorageKey = keyof typeof STORAGE_KEYS;