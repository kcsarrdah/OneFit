// frontend/utils/utils.ts

/**
 * @file utils.ts
 * @description This file contains utility functions used throughout the FastTrack application.
 *
 * Exports:
 *   - `formatTime`: A utility function to format a total number of seconds into a `HH:MM:SS` string.
 *     How to use: `formatTime(3661)` returns `"01:01:01"`.
 *     Handles negative input by treating it as 0.
 *     If hours is 0, returns format `MM:SS` instead of `HH:MM:SS`.
 */

export const formatTime = (totalSeconds: number): string => {
    if (totalSeconds < 0) totalSeconds = 0;
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
  
    // If we have hours, show HH:MM:SS
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    
    // Otherwise show MM:SS
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };