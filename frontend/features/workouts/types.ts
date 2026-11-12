/**
 * @file types.ts
 * @description Shared workout types: the exercise catalogue, a session's sets
 * and exercises, routines and saved workouts.
 */

export type MuscleGroup = 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Core';
export type Equipment = 'Barbell' | 'Dumbbells' | 'Machine' | 'Cable' | 'Bodyweight';
export type WeightUnit = 'kg' | 'lbs';
export type RoutineDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type RoutineCategory = 'Strength' | 'Cardio' | 'HIIT' | 'Full Body' | 'Upper Body' | 'Lower Body';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment?: Equipment;
  instructions?: string;
}

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  estimatedDuration: number; // in minutes
  difficulty: RoutineDifficulty;
  category: RoutineCategory;
}

/** A routine the user made or duplicated; stored on the device. */
export interface CustomRoutine extends WorkoutRoutine {
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

/** The fields the "Create custom routine" form collects. */
export type NewRoutine = Pick<
  WorkoutRoutine,
  'name' | 'description' | 'exercises' | 'estimatedDuration' | 'difficulty' | 'category'
>;

export interface SavedWorkout {
  id: string;
  name: string;
  date: string;
  exercises: WorkoutExercise[];
  duration: number;
  notes?: string;
  totalSets: number;
  completedSets: number;
  totalVolume: number;
  weightUnit: WeightUnit;
}
