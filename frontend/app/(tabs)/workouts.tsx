import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNavigation } from '@/contexts/NavigationContext';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import { useWeightUnit } from '@/hooks/useWeightUnit';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExerciseSelectionModal } from '@/components/ExcerciseSelectionModel';
import { Exercise, WorkoutSet, SavedWorkout, WorkoutExercise, WorkoutRoutine, WORKOUT_ROUTINES } from '@/constants/workoutData';
import { WheelPicker } from '@/components/ui/WheelPicker';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { useCustomRoutines, CustomRoutine } from '@/hooks/useCustomRoutines';
import { CreateCustomRoutineModal } from '@/components/CreateCustomRoutineModal';

/**
 * @file workouts.tsx
 * @description Main workout screen with internal navigation for workout tracking features.
 * 
 * Navigation Structure:
 *   - Workout: Current session with timer and exercises
 *   - Routines: Browse and create workout routines  
 *   - Exercises: Exercise library with filtering
 *   - History: Past workout history and progress
 */

export default function WorkoutsScreen() {
  const { currentSidebarOption, setCurrentSidebarOption } = useNavigation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  // Workout session hooks - shared across components
  const { 
    exercises, 
    workoutStats, 
    hasActiveWorkout,
    addExercise,
    addExercisesFromRoutine,
    resetSession,
    addSetToExercise,
    updateSet,
    removeSet,
    isLoading: sessionLoading 
  } = useWorkoutSession();

  // Workout timer hooks - shared across components
  const { 
    duration, 
    isActive, 
    start, 
    pause, 
    stop, 
    reset, 
    formattedTime,
    isLoading: timerLoading 
  } = useWorkoutTimer();

  // Render content based on selected sidebar option
  const renderContent = () => {
    const timerProps = {
      duration,
      isActive,
      start,
      pause,
      stop,
      reset,
      formattedTime,
    };

    const sessionProps = {
      exercises,
      workoutStats,
      hasActiveWorkout,
      addExercise,
      addExercisesFromRoutine,
      resetSession,
      addSetToExercise,
      updateSet,
      removeSet,
    };

    switch (currentSidebarOption) {
      case 'workout':
        return <WorkoutScreen 
          timer={timerProps}
          session={sessionProps}
          timerLoading={timerLoading}
          sessionLoading={sessionLoading}
        />;
      case 'routines':
        return <RoutinesScreen 
          onStartRoutine={(routine) => {
            // Add all exercises from routine to workout session
            addExercisesFromRoutine(routine.exercises);
            // Start the timer
            start();
            // Navigate to workout screen
            setCurrentSidebarOption('workout');
          }}
        />;
      case 'exercises':
        return <ExercisesScreen />;
      case 'workout-history':
        return <HistoryScreen />;
      default:
        return <WorkoutScreen 
          timer={timerProps}
          session={sessionProps}
          timerLoading={timerLoading}
          sessionLoading={sessionLoading}
        />; // Default to workout screen
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
        {renderContent()}
    </ThemedView>

  );
}

// Main Workout Screen Component
interface WorkoutScreenProps {
  timer: {
    duration: number;
    isActive: boolean;
    start: () => void;
    pause: () => void;
    stop: () => void;
    reset: () => void;
    formattedTime: string;
  };
  session: {
    exercises: any[];
    workoutStats: any;
    hasActiveWorkout: boolean;
    addExercise: (exercise: Exercise) => void;
    addExercisesFromRoutine: (exercises: Exercise[]) => void;
    resetSession: () => void;
    addSetToExercise: (exerciseId: string, weight: number, reps: number) => void;
    updateSet: (exerciseId: string, setId: string, updates: any) => void;
    removeSet: (exerciseId: string, setId: string) => void;
  };
  timerLoading: boolean;
  sessionLoading: boolean;
}

function WorkoutScreen({ timer, session, timerLoading, sessionLoading }: WorkoutScreenProps) {
  const { saveWorkout } = useWorkoutHistory();
  
  const { 
    duration, 
    isActive, 
    start, 
    pause, 
    stop, 
    reset, 
    formattedTime 
  } = timer;
  
  const { 
    exercises, 
    workoutStats, 
    hasActiveWorkout,
    addExercise,
    addExercisesFromRoutine,
    resetSession,
    addSetToExercise,
    updateSet,
    removeSet
  } = session;

  console.log('WorkoutScreen Debug:', {
    exercisesCount: exercises.length,
    hasActiveWorkout,
    timerLoading,
    sessionLoading,
    exerciseNames: exercises.map(e => e.exercise.name)
  });
  
  const { weightUnit, toggleWeightUnit } = useWeightUnit();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Show loading state
  if (timerLoading || sessionLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText>Loading workout...</ThemedText>
      </View>
    );
  }

  // Empty state - no active workout
  if (!hasActiveWorkout) {
    return <EmptyWorkoutState 
      timer={{ duration, isActive, start, pause, stop, reset, formattedTime }}
      weightUnit={weightUnit}
      onAddExercise={addExercise} // Change from onAddExercise to addExercise
    />;
  }

  // Active workout state
  return <ActiveWorkoutState 
    exercises={exercises}
    workoutStats={workoutStats}
    timer={{ duration, isActive, start, pause, stop, reset, formattedTime }}
    weightUnit={weightUnit}
    onToggleWeightUnit={toggleWeightUnit}
    onAddExercise={addExercise}
    onResetSession={resetSession}
    onAddSetToExercise={addSetToExercise} // Add this
    onUpdateSet={updateSet} // Add this
    onRemoveSet={removeSet} // Add this
    onSaveWorkout={saveWorkout} // Add this
  />;
}

// Empty State Component (matches prototype's "Ready to Crush It?" design)
interface EmptyWorkoutStateProps {
  timer: {
    duration: number;
    isActive: boolean;
    start: () => void;
    pause: () => void;
    stop: () => void;
    reset: () => void;
    formattedTime: string;
  };
  weightUnit: string;
  onAddExercise: (exercise: Exercise) => void;
}

function EmptyWorkoutState({ timer, onAddExercise }: EmptyWorkoutStateProps) {
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const { setCurrentSidebarOption } = useNavigation(); // Add this line
  const insets = useSafeAreaInsets();
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Add this function
  const handleSelectExercise = (exercise: Exercise) => {
    console.log('Adding exercise:', exercise.name);
    onAddExercise(exercise);
    // Force a small delay to see if it's a state update timing issue
    setTimeout(() => {
      console.log('Delayed check - should see Active Workout now');
    }, 100);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[
      styles.emptyStateContent,
      { paddingBottom: insets.bottom + 20 }
    ]}>
      <Card style={[styles.welcomeCard, { backgroundColor: colors.card }]}>
        <CardContent style={styles.welcomeCardContent}>
          {/* Welcome Icon */}
          <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
            <IconSymbol name="bolt.fill" size={48} color={colors.accentForeground} />
          </View>
          
          {/* Welcome Text */}
          <CardTitle style={[styles.welcomeTitle, { color: colors.foreground }]}>
            Ready to Crush It?
          </CardTitle>
          <ThemedText style={[styles.welcomeSubtext, { color: colors.mutedForeground }]}>
            Choose a routine or add individual exercises to begin your epic workout journey.
          </ThemedText>

          {/* Timer Display */}
          <View style={[styles.timerDisplay, { backgroundColor: colors.secondary }]}>
            <IconSymbol 
              name="timer" 
              size={24} 
              color={timer.isActive ? colors.accent : colors.mutedForeground} 
            />
            <ThemedText style={[styles.timerText, { color: colors.foreground }]}>
              {timer.formattedTime}
            </ThemedText>
          </View>

          {/* Timer Controls */}
          <View style={styles.timerControls}>
            {!timer.isActive ? (
              <Button 
                onPress={timer.start}
                variant="default"
                size="lg"
                style={[styles.primaryButton, { backgroundColor: colors.accent }]}
              >
                <View style={styles.buttonContent}>
                  <IconSymbol name="timer" size={20} color={colors.accentForeground} />
                  <ThemedText style={[styles.buttonText, { color: colors.accentForeground }]}>
                    Start Timer
                  </ThemedText>
                </View>
              </Button>
            ) : (
              <View style={styles.activeTimerControls}>
                <Button 
                  onPress={timer.pause}
                  variant="secondary"
                  size="default"
                  style={styles.timerButton}
                >
                  <IconSymbol name="timer" size={16} color={colors.foreground} />
                </Button>
                <Button 
                  onPress={timer.stop}
                  variant="destructive"
                  size="default"
                  style={styles.timerButton}
                >
                  <IconSymbol name="stop.fill" size={16} color={colors.destructiveForeground} />
                </Button>
                <Button 
                  onPress={timer.reset}
                  variant="outline"
                  size="default"
                  style={styles.timerButton}
                >
                  <IconSymbol name="house.fill" size={16} color={colors.foreground} />
                </Button>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button 
              onPress={() => setCurrentSidebarOption('routines')} // Updated this line
              variant="default"
              size="lg"
              style={[styles.actionButton, { backgroundColor: colors.accent }]}
            >
              <ThemedText style={[styles.buttonText, { color: colors.accentForeground }]}>
                Browse Routines
              </ThemedText>
            </Button>
            
            <Button 
              onPress={() => setShowExerciseModal(true)} // Wire up the modal
              variant="outline"
              size="lg"
              style={styles.actionButton}
            >
              <ThemedText style={[styles.buttonText, { color: colors.foreground }]}>
                Browse Exercises
              </ThemedText>
            </Button>
          </View>
        </CardContent>
      </Card>

      {/* Add the modal */}
      <ExerciseSelectionModal
        visible={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        onSelectExercise={handleSelectExercise}
      />
    </ScrollView>
  );
}

// Active Workout State Component (for when exercises are added)
interface ActiveWorkoutStateProps {
  exercises: any[];
  workoutStats: any;
  timer: any;
  weightUnit: string;
  onToggleWeightUnit: () => void;
  onAddExercise: (exercise: Exercise) => void;
  onResetSession: () => void;
  onAddSetToExercise: (exerciseId: string, weight: number, reps: number) => void; // Add this
  onUpdateSet: (exerciseId: string, setId: string, updates: any) => void; // Add this
  onRemoveSet: (exerciseId: string, setId: string) => void; // Add this
  onSaveWorkout: (exercises: WorkoutExercise[], duration: number, weightUnit: 'kg' | 'lbs', workoutName?: string) => Promise<SavedWorkout>; // Add this
}

function ActiveWorkoutState({ 
  exercises, 
  workoutStats, 
  timer, 
  weightUnit, // Add this
  onToggleWeightUnit, // Add this
  onAddExercise,
  onResetSession,
  onAddSetToExercise,
  onUpdateSet,
  onRemoveSet,
  onSaveWorkout // Add this parameter
}: ActiveWorkoutStateProps) {
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  // Update this function to use the real addExercise
  const handleSelectExercise = (exercise: Exercise) => {
    onAddExercise(exercise); // Now this will actually add the exercise!
    console.log('Adding another exercise:', exercise.name);
  };

  const handleCancelWorkout = () => {
    timer.stop(); // Stop the timer
    onResetSession(); // Clear all exercises - this will go back to "Ready to Crush It"
    console.log('Workout cancelled');
  };

  const handleSaveWorkout = async () => {
    try {
      timer.stop(); // Stop the timer
      
      // Save the workout
      const savedWorkout = await onSaveWorkout(exercises, timer.duration, weightUnit as 'kg' | 'lbs');
      
      console.log('Workout saved successfully:', savedWorkout.name);
      
      // Reset the session
      onResetSession();
    } catch (error) {
      console.error('Failed to save workout:', error);
      // TODO: Show error toast/alert to user
    }
  };

  // New state for set tracking
  const [sets, setSets] = useState<any[]>([]);

  const handleAddSet = (exerciseId: string) => {
    // Add a default set with reasonable starting values
    onAddSetToExercise(exerciseId, 0, 8); // 0 weight, 8 reps default
  };

  const handleUpdateSet = (exerciseId: string, setId: string, updates: any) => {
    onUpdateSet(exerciseId, setId, updates);
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    onRemoveSet(exerciseId, setId);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[
      styles.activeWorkoutContent,
      { paddingBottom: insets.bottom + 20 }
    ]}>
      {/* Timer Header */}
      <Card style={[styles.timerCard, { backgroundColor: colors.card }]}>
        <CardContent style={styles.timerCardContent}>
          <View style={styles.timerSection}>
            <IconSymbol 
              name="timer" 
              size={24} 
              color={timer.isActive ? colors.accent : colors.mutedForeground} 
            />
            <ThemedText style={[styles.timerText, { color: colors.foreground }]}>
              {timer.formattedTime}
            </ThemedText>
          </View>
          
          <View style={styles.activeWorkoutTimerControls}>
            {!timer.isActive ? (
              <Button onPress={timer.start} variant="default" size="sm">
                <ThemedText style={{ color: colors.accentForeground }}>Start</ThemedText>
              </Button>
            ) : (
              <View style={styles.activeTimerControls}>
                <Button onPress={timer.pause} variant="secondary" size="sm">
                  <ThemedText style={{ color: colors.foreground }}>Pause</ThemedText>
                </Button>
                <Button onPress={timer.stop} variant="destructive" size="sm">
                  <ThemedText style={{ color: colors.destructiveForeground }}>Stop</ThemedText>
                </Button>
              </View>
            )}
          </View>
        </CardContent>

        {/* Add Workout Actions Row */}
        <CardContent style={styles.workoutActions}>
          <Button 
            onPress={handleCancelWorkout} // Update this
            variant="outline" 
            size="sm"
            style={styles.workoutActionButton}
          >
            <ThemedText style={{ color: colors.foreground }}>Cancel Workout</ThemedText>
          </Button>
          
          <Button 
            onPress={handleSaveWorkout} // Update this
            variant="default" 
            size="sm"
            style={[styles.workoutActionButton, { backgroundColor: colors.accent }]}
          >
            <ThemedText style={{ color: colors.accentForeground }}>Save Workout</ThemedText>
          </Button>
        </CardContent>
      </Card>

      {/* Workout Stats */}
      <Card style={[styles.statsCard, { backgroundColor: colors.card }]}>
        <CardContent style={styles.statsContent}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: colors.foreground }]}>
              {exercises.length}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Exercises
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: colors.foreground }]}>
              {workoutStats.totalSets}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Sets
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: colors.foreground }]}>
              {workoutStats.completedSets}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Completed
            </ThemedText>
          </View>
        </CardContent>
      </Card>

      {/* Add Exercise Button */}
      <Button 
        onPress={() => setShowExerciseModal(true)}
        variant="outline"
        size="default"
        style={[styles.addExerciseButton, { borderColor: colors.border }]}
      >
        <ThemedText style={[styles.addExerciseText, { color: colors.foreground }]}>
          + Add Exercise
        </ThemedText>
      </Button>

      {/* Exercise List */}
      <View style={styles.exercisesList}>
        {exercises.map((workoutExercise, index) => (
          <Card key={workoutExercise.id} style={[styles.exerciseCard, { backgroundColor: colors.card }]}>
            <CardContent style={styles.exerciseCardContent}>
              <View style={styles.exerciseHeader}>
                <ThemedText style={[styles.exerciseName, { color: colors.foreground }]}>
                  {workoutExercise.exercise.name}
                </ThemedText>
                <ThemedText style={[styles.exerciseMuscle, { color: colors.mutedForeground }]}>
                  {workoutExercise.exercise.muscleGroup}
                </ThemedText>
              </View>
              
              {/* Sets Tracking */}
              <View style={styles.setsSection}>
                <View style={styles.setsHeader}>
                  <ThemedText style={[styles.setsTitle, { color: colors.foreground }]}>
                    Sets ({workoutExercise.sets.length})
                  </ThemedText>
                  <Button
                    onPress={() => handleAddSet(workoutExercise.id)}
                    variant="outline"
                    size="sm"
                    style={styles.addSetButton}
                  >
                    <ThemedText style={[styles.addSetText, { color: colors.foreground }]}>
                      + Add Set
                    </ThemedText>
                  </Button>
                </View>

                {/* Set List */}
                {workoutExercise.sets.length > 0 ? (
                  <View style={styles.setsList}>
                    {workoutExercise.sets.map((set: WorkoutSet, setIndex: number) => (
                      <View key={set.id} style={[styles.setRow, { backgroundColor: colors.secondary }]}>
                        <View style={styles.setNumber}>
                          <ThemedText style={[styles.setNumberText, { color: colors.foreground }]}>
                            {setIndex + 1}
                          </ThemedText>
                        </View>
                        
                        <View style={styles.setInputs}>
                          <View style={styles.inputGroup}>
                            <ThemedText style={[styles.inputLabel, { color: colors.mutedForeground }]}>
                              Weight
                            </ThemedText>
                            <WheelPicker
                              selectedValue={set.weight}
                              onValueChange={(weight) => handleUpdateSet(workoutExercise.id, set.id, { weight })}
                              min={0}
                              max={300}
                              step={1}
                              suffix={` ${weightUnit}`}
                              disabled={set.completed}
                            />
                          </View>
                          
                          <View style={styles.inputGroup}>
                            <ThemedText style={[styles.inputLabel, { color: colors.mutedForeground }]}>
                              Reps
                            </ThemedText>
                            <WheelPicker
                              selectedValue={set.reps}
                              onValueChange={(reps) => handleUpdateSet(workoutExercise.id, set.id, { reps })}
                              min={1}
                              max={50}
                              step={1}
                              suffix=" reps"
                              disabled={set.completed}
                            />
                          </View>
                        </View>
                        
                        <View style={styles.setActions}>
                          <Button
                            onPress={() => handleRemoveSet(workoutExercise.id, set.id)}
                            variant="ghost"
                            size="sm"
                            style={styles.removeSetButton}
                          >
                            <ThemedText style={[styles.removeSetText, { color: colors.destructive }]}>
                              ✕
                            </ThemedText>
                          </Button>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noSetsMessage}>
                    <ThemedText style={[styles.noSetsText, { color: colors.mutedForeground }]}>
                      No sets added yet. Tap "+ Add Set" to get started!
                    </ThemedText>
                  </View>
                )}
              </View>
            </CardContent>
          </Card>
        ))}
      </View>

      {/* Exercise Selection Modal */}
      <ExerciseSelectionModal
        visible={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        onSelectExercise={handleSelectExercise}
      />
    </ScrollView>
  );
}

// Placeholder components for other screens
interface RoutinesScreenProps {
  onStartRoutine: (routine: WorkoutRoutine | CustomRoutine) => void;
}

function RoutinesScreen({ onStartRoutine }: RoutinesScreenProps) {
  const { getAllRoutines, isLoading, duplicateRoutine, deleteCustomRoutine, createCustomRoutine } = useCustomRoutines();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const categories = ['All', 'Full Body', 'Upper Body', 'Lower Body', 'Strength', 'Cardio', 'HIIT'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const allRoutines = getAllRoutines();
  
  // Filter routines based on selected filters
  const filteredRoutines = allRoutines.filter(routine => {
    const matchesCategory = selectedCategory === 'All' || routine.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || routine.difficulty === selectedDifficulty;
    return matchesCategory && matchesDifficulty;
  });

  const handleStartRoutine = useCallback((routine: WorkoutRoutine | CustomRoutine) => {
    console.log('Starting routine:', routine.name);
    onStartRoutine(routine);
  }, [onStartRoutine]);

  const handleDuplicateRoutine = useCallback(async (routine: WorkoutRoutine | CustomRoutine) => {
    try {
      await duplicateRoutine(routine);
      console.log('Routine duplicated successfully');
    } catch (error) {
      console.error('Failed to duplicate routine:', error);
    }
  }, [duplicateRoutine]);

  const handleDeleteRoutine = useCallback(async (routineId: string) => {
    try {
      await deleteCustomRoutine(routineId);
      console.log('Routine deleted successfully');
    } catch (error) {
      console.error('Failed to delete routine:', error);
    }
  }, [deleteCustomRoutine]);

  const handleCreateRoutine = async (
    name: string,
    description: string,
    exercises: Exercise[],
    estimatedDuration: number,
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
    category: 'Strength' | 'Cardio' | 'HIIT' | 'Full Body' | 'Upper Body' | 'Lower Body'
  ) => {
    try {
      await createCustomRoutine(name, description, exercises, estimatedDuration, difficulty, category);
      console.log('Custom routine created successfully');
    } catch (error) {
      console.error('Failed to create custom routine:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.placeholderContainer}>
        <ThemedText>Loading routines...</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[
        styles.routinesContent,
        { paddingBottom: insets.bottom + 20 }
      ]}
    >
      {/* Header */}
      <View style={styles.routinesHeader}>
        <ThemedText style={[styles.screenTitle, { color: colors.foreground }]}>
          Workout Routines
        </ThemedText>
        <Button
          onPress={() => setShowCreateModal(true)}
          variant="default"
          size="sm"
          style={[styles.createButton, { backgroundColor: colors.accent }]}
        >
          <ThemedText style={[styles.createButtonText, { color: colors.accentForeground }]}>
            + Create
          </ThemedText>
        </Button>
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <View style={styles.filterRow}>
          <ThemedText style={[styles.filterLabel, { color: colors.mutedForeground }]}>
            Category
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
            {categories.map(category => (
              <Button
                key={category}
                onPress={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                style={[
                  styles.filterButton,
                  selectedCategory === category && { backgroundColor: colors.accent }
                ]}
              >
                <ThemedText style={[
                  styles.filterButtonText,
                  { color: selectedCategory === category ? colors.accentForeground : colors.foreground }
                ]}>
                  {category}
                </ThemedText>
              </Button>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterRow}>
          <ThemedText style={[styles.filterLabel, { color: colors.mutedForeground }]}>
            Difficulty
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
            {difficulties.map(difficulty => (
              <Button
                key={difficulty}
                onPress={() => setSelectedDifficulty(difficulty)}
                variant={selectedDifficulty === difficulty ? "default" : "outline"}
                size="sm"
                style={[
                  styles.filterButton,
                  selectedDifficulty === difficulty && { backgroundColor: colors.accent }
                ]}
              >
                <ThemedText style={[
                  styles.filterButtonText,
                  { color: selectedDifficulty === difficulty ? colors.accentForeground : colors.foreground }
                ]}>
                  {difficulty}
                </ThemedText>
              </Button>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Routines List */}
      <View style={styles.routinesList}>
        {filteredRoutines.length === 0 ? (
          <View style={styles.noRoutinesMessage}>
            <ThemedText style={[styles.noRoutinesText, { color: colors.mutedForeground }]}>
              No routines found matching your filters
            </ThemedText>
          </View>
        ) : (
          filteredRoutines.map(routine => (
            <Card key={routine.id} style={[styles.routineCard, { backgroundColor: colors.card }]}>
              <CardContent style={styles.routineCardContent}>
                <View style={styles.routineHeader}>
                  <View style={styles.routineInfo}>
                    <ThemedText style={[styles.routineName, { color: colors.foreground }]}>
                      {routine.name}
                      {'isCustom' in routine && routine.isCustom && (
                        <ThemedText style={[styles.customBadge, { color: colors.accent }]}>
                          {' '}• Custom
                        </ThemedText>
                      )}
                    </ThemedText>
                    <ThemedText style={[styles.routineDescription, { color: colors.mutedForeground }]}>
                      {routine.description}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.routineStats}>
                  <View style={styles.routineStatItem}>
                    <ThemedText style={[styles.routineStatNumber, { color: colors.foreground }]}>
                      {routine.estimatedDuration}
                    </ThemedText>
                    <ThemedText style={[styles.routineStatLabel, { color: colors.mutedForeground }]}>
                      Minutes
                    </ThemedText>
                  </View>
                  <View style={styles.routineStatItem}>
                    <ThemedText style={[styles.routineStatNumber, { color: colors.foreground }]}>
                      {routine.exercises.length}
                    </ThemedText>
                    <ThemedText style={[styles.routineStatLabel, { color: colors.mutedForeground }]}>
                      Exercises
                    </ThemedText>
                  </View>
                  <View style={styles.routineStatItem}>
                    <ThemedText style={[styles.routineStatNumber, { color: colors.foreground }]}>
                      {routine.difficulty}
                    </ThemedText>
                    <ThemedText style={[styles.routineStatLabel, { color: colors.mutedForeground }]}>
                      Level
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.routineActions}>
                  <Button
                    onPress={() => handleStartRoutine(routine)}
                    variant="default"
                    size="sm"
                    style={[styles.startButton, { backgroundColor: colors.accent }]}
                  >
                    <ThemedText style={[styles.startButtonText, { color: colors.accentForeground }]}>
                      Start Workout
                    </ThemedText>
                  </Button>
                  
                  <View style={styles.routineSecondaryActions}>
                    <Button
                      onPress={() => handleDuplicateRoutine(routine)}
                      variant="outline"
                      size="sm"
                      style={styles.secondaryButton}
                    >
                      <ThemedText style={[styles.secondaryButtonText, { color: colors.foreground }]}>
                        Duplicate
                      </ThemedText>
                    </Button>
                    
                    {'isCustom' in routine && routine.isCustom && (
                      <Button
                        onPress={() => handleDeleteRoutine(routine.id)}
                        variant="ghost"
                        size="sm"
                        style={styles.routineDeleteButton}
                      >
                        <ThemedText style={[styles.deleteButtonText, { color: colors.destructive }]}>
                          Delete
                        </ThemedText>
                      </Button>
                    )}
                  </View>
                </View>
              </CardContent>
            </Card>
          ))
        )}
      </View>

      {/* Replace the TODO comment with the actual modal */}
      <CreateCustomRoutineModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoutine={handleCreateRoutine}
      />
    </ScrollView>
  );
}

function ExercisesScreen() {
  return (
    <View style={styles.placeholderContainer}>
      <ThemedText style={styles.placeholder}>Exercise Library</ThemedText>
      <ThemedText>Search and filter exercises</ThemedText>
    </View>
  );
}

function HistoryScreen() {
  const { workoutHistory, isLoading, overallStats, deleteWorkout } = useWorkoutHistory();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <View style={styles.placeholderContainer}>
        <ThemedText>Loading workout history...</ThemedText>
      </View>
    );
  }

  if (workoutHistory.length === 0) {
    return (
      <View style={styles.placeholderContainer}>
        <ThemedText style={[styles.placeholder, { color: colors.foreground }]}>
          No Workouts Yet
        </ThemedText>
        <ThemedText style={{ color: colors.mutedForeground }}>
          Complete your first workout to see it here!
        </ThemedText>
      </View>
    );
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[
        styles.historyContent,
        { paddingBottom: insets.bottom + 20 }
      ]}
    >
      {/* Overall Stats Card */}
      <Card style={[styles.statsCard, { backgroundColor: colors.card }]}>
        <CardContent style={styles.overallStatsContent}>
          <ThemedText style={[styles.statsTitle, { color: colors.foreground }]}>
            Your Progress
          </ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: colors.accent }]}>
                {overallStats.totalWorkouts}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Workouts
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: colors.accent }]}>
                {Math.round(overallStats.totalDuration / 60)}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Total Minutes
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: colors.accent }]}>
                {Math.round(overallStats.totalVolume)}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Total Volume
              </ThemedText>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Workout History List */}
      <View style={styles.historyList}>
        {workoutHistory.map((workout) => (
          <Card key={workout.id} style={[styles.workoutCard, { backgroundColor: colors.card }]}>
            <CardContent style={styles.workoutCardContent}>
              <View style={styles.workoutHeader}>
                <View style={styles.workoutInfo}>
                  <ThemedText style={[styles.workoutName, { color: colors.foreground }]}>
                    {workout.name}
                  </ThemedText>
                  <ThemedText style={[styles.workoutDate, { color: colors.mutedForeground }]}>
                    {formatDate(workout.date)}
                  </ThemedText>
                </View>
                <View style={styles.historyWorkoutActions}>
                  <Button
                    onPress={() => deleteWorkout(workout.id)}
                    variant="ghost"
                    size="sm"
                    style={styles.deleteButton}
                  >
                    <ThemedText style={[styles.deleteText, { color: colors.destructive }]}>
                      ✕
                    </ThemedText>
                  </Button>
                </View>
              </View>

              <View style={styles.workoutStats}>
                <View style={styles.workoutStatItem}>
                  <ThemedText style={[styles.workoutStatNumber, { color: colors.foreground }]}>
                    {formatDuration(workout.duration)}
                  </ThemedText>
                  <ThemedText style={[styles.workoutStatLabel, { color: colors.mutedForeground }]}>
                    Duration
                  </ThemedText>
                </View>
                <View style={styles.workoutStatItem}>
                  <ThemedText style={[styles.workoutStatNumber, { color: colors.foreground }]}>
                    {workout.exercises.length}
                  </ThemedText>
                  <ThemedText style={[styles.workoutStatLabel, { color: colors.mutedForeground }]}>
                    Exercises
                  </ThemedText>
                </View>
                <View style={styles.workoutStatItem}>
                  <ThemedText style={[styles.workoutStatNumber, { color: colors.foreground }]}>
                    {workout.completedSets}/{workout.totalSets}
                  </ThemedText>
                  <ThemedText style={[styles.workoutStatLabel, { color: colors.mutedForeground }]}>
                    Sets
                  </ThemedText>
                </View>
                <View style={styles.workoutStatItem}>
                  <ThemedText style={[styles.workoutStatNumber, { color: colors.foreground }]}>
                    {Math.round(workout.totalVolume)} {workout.weightUnit}
                  </ThemedText>
                  <ThemedText style={[styles.workoutStatLabel, { color: colors.mutedForeground }]}>
                    Volume
                  </ThemedText>
                </View>
              </View>

              {/* Exercise Summary */}
              <View style={styles.exercisesSummary}>
                <ThemedText style={[styles.exercisesSummaryTitle, { color: colors.mutedForeground }]}>
                  Exercises:
                </ThemedText>
                <ThemedText style={[styles.exercisesListText, { color: colors.foreground }]}>
                  {workout.exercises.map(ex => ex.exercise.name).join(', ')}
                </ThemedText>
              </View>
            </CardContent>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  emptyStateContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,           // This controls how high the card appears
    paddingBottom: 20,
  },
  
  welcomeCard: {
    flex: 1,                  // Takes available space
    maxHeight: 600,           // But not too tall
    borderRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeCardContent: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  
  // CONTENT SPACING - Consistent margins
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 35,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  
  // TIMER SECTION
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 25,
    gap: 8,
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  timerControls: {
    marginBottom: 30,
    alignItems: 'center',
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 30, 
    minWidth: 140,             
    alignItems: 'center', 
  },
  activeTimerControls: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  timerButton: {
    borderRadius: 8,
    padding: 10,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // ACTION BUTTONS
  actionButtons: {
    width: '80%',             
    gap: 12,
    marginTop: 10,              
    marginBottom: 10,                        
  },
  actionButton: {
    borderRadius: 12,
    justifyContent: 'center',
    paddingVertical: 12,        
    minHeight: 45,              
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 0,  
  },
  
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  placeholder: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  activeWorkoutContent: {
    padding: 16,
  },
  timerCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  timerCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeWorkoutTimerControls: {
    flexDirection: 'row',
    gap: 8,
  },
  statsCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  addExerciseButton: {
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 20,        // Try increasing this
    paddingHorizontal: 24,      // Try increasing this  
    minHeight: 60,              // Try increasing this
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',              // Add this to ensure full width
  },
  addExerciseText: {
    fontSize: 18,               // Try increasing from 16
    fontWeight: '600',
    textAlign: 'center',        // Add this
  },
  exercisesList: {
    gap: 12,
  },
  exerciseCard: {
    borderRadius: 16,
  },
  exerciseCardContent: {
    padding: 16,
  },
  exerciseHeader: {
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  exerciseMuscle: {
    fontSize: 14,
  },
  setsSection: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    marginTop: 12,
  },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  setsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  addSetButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addSetText: {
    fontSize: 14,
    fontWeight: '500',
  },
  setsList: {
    gap: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 8, // Reduce padding from 12 to 8
    borderRadius: 8,
    gap: 8, // Reduce gap from 12 to 8
  },
  setNumber: {
    width: 28, // Reduce from 32 to 28
    height: 28, // Reduce from 32 to 28
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  setNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  setInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 8, // Reduce gap from 12 to 8
  },
  inputGroup: {
    flex: 1,
    minHeight: 120,
    // Remove any width constraints
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  setActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeSetButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeSetText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noSetsMessage: {
    padding: 16,
    alignItems: 'center',
  },
  noSetsText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  workoutActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  workoutActionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
  },
  pickerStyle: {
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginTop: 4,
  },
  
  historyContent: {
    padding: 16,
  },
  overallStatsContent: {
    padding: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  historyList: {
    marginTop: 16,
    gap: 12,
  },
  workoutCard: {
    borderRadius: 16,
  },
  workoutCardContent: {
    padding: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workoutDate: {
    fontSize: 14,
  },
  historyWorkoutActions: {
    marginLeft: 12,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  workoutStatItem: {
    alignItems: 'center',
  },
  workoutStatNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  workoutStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  exercisesSummary: {
    marginTop: 8,
  },
  exercisesSummaryTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  exercisesListText: {
    fontSize: 14,
    lineHeight: 18,
  },
  // Routines Screen Styles
  routinesContent: {
    padding: 16,
  },
  routinesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filtersSection: {
    marginBottom: 24,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterButton: {
    marginRight: 8,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  routinesList: {
    gap: 16,
  },
  routineCard: {
    borderRadius: 16,
  },
  routineCardContent: {
    padding: 16,
  },
  routineHeader: {
    marginBottom: 16,
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customBadge: {
    fontSize: 14,
    fontWeight: '500',
  },
  routineDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  routineStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  routineStatItem: {
    alignItems: 'center',
  },
  routineStatNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  routineStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  routineActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startButton: {
    flex: 1,
    marginRight: 12,
    borderRadius: 8,
    paddingVertical: 10,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  routineSecondaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  routineDeleteButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  noRoutinesMessage: {
    padding: 32,
    alignItems: 'center',
  },
  noRoutinesText: {
    fontSize: 16,
    textAlign: 'center',
  },
});