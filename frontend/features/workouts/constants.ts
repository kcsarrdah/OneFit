/**
 * @file constants.ts
 * @description The built-in exercise catalogue, starter routines and the
 * option lists the workout screens filter by.
 */

import type { Exercise, MuscleGroup, RoutineCategory, RoutineDifficulty, WorkoutRoutine } from './types';

export const MUSCLE_GROUPS: readonly MuscleGroup[] = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];

export const ROUTINE_DIFFICULTIES: readonly RoutineDifficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

/** In the order the "Create custom routine" form lists them. */
export const ROUTINE_CATEGORIES: readonly RoutineCategory[] = [
  'Full Body',
  'Upper Body',
  'Lower Body',
  'Strength',
  'Cardio',
  'HIIT',
];

/** The Routines screen's filter chips: everything, or one category. */
export const ROUTINE_FILTERS: readonly ('All' | RoutineCategory)[] = ['All', ...ROUTINE_CATEGORIES];

// Built-in exercise catalogue
export const EXERCISES: Exercise[] = [
  // Chest
  { id: 'bench-press', name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell' },
  { id: 'incline-bench', name: 'Incline Bench Press', muscleGroup: 'Chest', equipment: 'Barbell' },
  { id: 'dumbbell-press', name: 'Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbells' },
  { id: 'chest-fly', name: 'Chest Fly', muscleGroup: 'Chest', equipment: 'Dumbbells' },
  { id: 'push-ups', name: 'Push-ups', muscleGroup: 'Chest', equipment: 'Bodyweight' },

  // Back
  { id: 'deadlift', name: 'Deadlift', muscleGroup: 'Back', equipment: 'Barbell' },
  { id: 'pull-ups', name: 'Pull-ups', muscleGroup: 'Back', equipment: 'Bodyweight' },
  { id: 'bent-over-row', name: 'Bent Over Row', muscleGroup: 'Back', equipment: 'Barbell' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cable' },

  // Shoulders
  { id: 'overhead-press', name: 'Overhead Press', muscleGroup: 'Shoulders', equipment: 'Barbell' },
  { id: 'lateral-raise', name: 'Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbells' },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', muscleGroup: 'Shoulders', equipment: 'Dumbbells' },

  // Arms
  { id: 'bicep-curl', name: 'Bicep Curl', muscleGroup: 'Arms', equipment: 'Dumbbells' },
  { id: 'tricep-dips', name: 'Tricep Dips', muscleGroup: 'Arms', equipment: 'Bodyweight' },
  { id: 'hammer-curl', name: 'Hammer Curl', muscleGroup: 'Arms', equipment: 'Dumbbells' },

  // Legs
  { id: 'squat', name: 'Squat', muscleGroup: 'Legs', equipment: 'Barbell' },
  { id: 'leg-press', name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine' },
  { id: 'lunges', name: 'Lunges', muscleGroup: 'Legs', equipment: 'Dumbbells' },
  { id: 'calf-raise', name: 'Calf Raise', muscleGroup: 'Legs', equipment: 'Dumbbells' },

  // Core
  { id: 'plank', name: 'Plank', muscleGroup: 'Core', equipment: 'Bodyweight' },
  { id: 'crunches', name: 'Crunches', muscleGroup: 'Core', equipment: 'Bodyweight' },
  { id: 'russian-twist', name: 'Russian Twist', muscleGroup: 'Core', equipment: 'Bodyweight' },
];

// Starter routines
export const WORKOUT_ROUTINES: WorkoutRoutine[] = [
  {
    id: 'beginner-full-body',
    name: 'Beginner Full Body',
    description: 'Perfect starter routine hitting all major muscle groups',
    exercises: [
      EXERCISES.find(e => e.id === 'squat')!,
      EXERCISES.find(e => e.id === 'push-ups')!,
      EXERCISES.find(e => e.id === 'bent-over-row')!,
      EXERCISES.find(e => e.id === 'overhead-press')!,
      EXERCISES.find(e => e.id === 'plank')!,
    ],
    estimatedDuration: 45,
    difficulty: 'Beginner',
    category: 'Full Body'
  },
  {
    id: 'upper-body-strength',
    name: 'Upper Body Strength',
    description: 'Build strength in chest, back, shoulders, and arms',
    exercises: [
      EXERCISES.find(e => e.id === 'bench-press')!,
      EXERCISES.find(e => e.id === 'pull-ups')!,
      EXERCISES.find(e => e.id === 'overhead-press')!,
      EXERCISES.find(e => e.id === 'bicep-curl')!,
      EXERCISES.find(e => e.id === 'tricep-dips')!,
    ],
    estimatedDuration: 60,
    difficulty: 'Intermediate',
    category: 'Upper Body'
  },
  {
    id: 'leg-day-crusher',
    name: 'Leg Day Crusher',
    description: 'Intense lower body workout for serious gains',
    exercises: [
      EXERCISES.find(e => e.id === 'squat')!,
      EXERCISES.find(e => e.id === 'deadlift')!,
      EXERCISES.find(e => e.id === 'leg-press')!,
      EXERCISES.find(e => e.id === 'lunges')!,
      EXERCISES.find(e => e.id === 'calf-raise')!,
    ],
    estimatedDuration: 50,
    difficulty: 'Advanced',
    category: 'Lower Body'
  },
  {
    id: 'quick-hiit',
    name: 'Quick HIIT',
    description: '20-minute high-intensity bodyweight workout',
    exercises: [
      EXERCISES.find(e => e.id === 'push-ups')!,
      EXERCISES.find(e => e.id === 'squat')!,
      EXERCISES.find(e => e.id === 'plank')!,
      EXERCISES.find(e => e.id === 'russian-twist')!,
    ],
    estimatedDuration: 20,
    difficulty: 'Intermediate',
    category: 'HIIT'
  },
  {
    id: 'chest-focus',
    name: 'Chest Focus',
    description: 'Target your chest muscles with this focused routine',
    exercises: [
      EXERCISES.find(e => e.id === 'bench-press')!,
      EXERCISES.find(e => e.id === 'incline-bench')!,
      EXERCISES.find(e => e.id === 'dumbbell-press')!,
      EXERCISES.find(e => e.id === 'push-ups')!,
    ],
    estimatedDuration: 40,
    difficulty: 'Intermediate',
    category: 'Strength'
  }
];
