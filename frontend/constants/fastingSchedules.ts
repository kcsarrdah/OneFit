// frontend/constants/fastingSchedules.ts

/**
 * @file fastingSchedules.ts
 * @description This file contains constant values used throughout the FastTrack application.
 *
 * Exports:
 *   - `FastingSchedule`: Interface defining the structure for a fasting schedule object.
 *   - `FASTING_SCHEDULES`: An array of predefined `FastingSchedule` objects.
 *     Each schedule includes an id, name, duration in hours, an icon name, and a description.
 *     The 'custom' schedule has a durationHours of 0, indicating its duration is user-defined.
 */

export interface FastingSchedule {
    id: string;
    name: string;
    durationHours: number; // 0 for custom
    iconName: string; // Name of the icon in our IconSymbol component
    description: string;
  }
  
  export const FASTING_SCHEDULES: FastingSchedule[] = [
    { 
      id: '16:8', 
      name: '16:8', 
      durationHours: 16, 
      iconName: 'clock.3', 
      description: 'Fast for 16 hours, eat within 8 hours.' 
    },
    { 
      id: '18:6', 
      name: '18:6', 
      durationHours: 18, 
      iconName: 'clock.6', 
      description: 'Fast for 18 hours, eat within 6 hours.' 
    },
    { 
      id: '20:4', 
      name: '20:4', 
      durationHours: 20, 
      iconName: 'clock.9', 
      description: 'Fast for 20 hours, eat within 4 hours.' 
    },
    { 
      id: 'custom', 
      name: 'Custom', 
      durationHours: 0, 
      iconName: 'pencil', 
      description: 'Set your own fasting duration.' 
    },
  ];