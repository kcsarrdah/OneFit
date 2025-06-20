/**
 * @file WaterTracking.ts
 * @description Constants for water tracking functionality
 */

// Default values
export const DEFAULT_GOAL = 2000; // ml
export const DEFAULT_LOG_AMOUNT = 250; // ml
export const STORAGE_PREFIX = "aquaViz_";

// Common water amounts for quick logging
export const QUICK_LOG_AMOUNTS = [
  { amount: 125, label: "Small Cup" },
  { amount: 250, label: "Cup" },
  { amount: 350, label: "Bottle" },
  { amount: 500, label: "Large Bottle" },
  { amount: 750, label: "Sports Bottle" },
  { amount: 1000, label: "Liter" },
];

// Goal presets
export const GOAL_PRESETS = [
  { amount: 1500, label: "Light Activity" },
  { amount: 2000, label: "Normal Activity" },
  { amount: 2500, label: "Active Lifestyle" },
  { amount: 3000, label: "High Activity" },
];

// Storage keys helper
export const getStorageKey = (key: string) => `${STORAGE_PREFIX}${key}`;

// Interfaces
export interface HistoryEntry {
  date: string;
  intake: number;
  goal: number;
}

export interface HydrationTrackerProps {
  userName?: string;
}