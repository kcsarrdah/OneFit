/**
 * @file fastingTypes.ts
 * @description Type definitions for the fasting tracking functionality
 */

/**
 * Represents a completed fast, with its details.
 */
export interface CompletedFast {
    id: string;
    startTime: number;
    endTime: number;
    actualDurationSeconds: number;
    goalDurationSeconds: number; // The planned goal when the fast was started
    notes?: string; // Optional field for user notes
  }
  
  /**
   * Interface defining the shape of the state object managed by the `useFastingTimer` hook.
   */
  export interface FastingTimerHookState {
    startTime: number | null;
    isActive: boolean;
    elapsedSeconds: number;
    pendingReviewFast: CompletedFast | null; // Holds a fast that was stopped/completed and awaits user review/save
  }
  
  /**
   * Interface defining the shape of the application settings object, stored in AsyncStorage.
   */
  export interface AppSettingsState {
    selectedScheduleId: string;
    customDurationHours?: number;
  }