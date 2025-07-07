import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNavigation } from '@/contexts/NavigationContext';
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

  // REMOVE: useWorkoutTimer completely

  // Render content based on selected sidebar option
  const renderContent = () => {
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
          session={sessionProps}
          sessionLoading={sessionLoading}
        />;
      case 'routines':
        return <RoutinesScreen 
          onStartRoutine={(routine) => {
            // Add all exercises from routine to workout session
            addExercisesFromRoutine(routine.exercises);
            // Start the timer
            // start(); // This line is removed
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
          session={sessionProps}
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
  sessionLoading: boolean;
}

function WorkoutScreen({ session, sessionLoading }: WorkoutScreenProps) {
  const { saveWorkout } = useWorkoutHistory();
  
  const { 
    exercises, 
    workoutStats, 
    hasActiveWorkout,
    addExercise,
    resetSession,
    addSetToExercise,
    updateSet,
    removeSet
  } = session;

  const { weightUnit, toggleWeightUnit } = useWeightUnit();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (sessionLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText>Loading workout...</ThemedText>
      </View>
    );
  }

  if (!hasActiveWorkout) {
    return <EmptyWorkoutState 
      weightUnit={weightUnit}
      onAddExercise={addExercise}
    />;
  }

  return <ActiveWorkoutState 
    exercises={exercises}
    workoutStats={workoutStats}
    weightUnit={weightUnit}
    onToggleWeightUnit={toggleWeightUnit}
    onAddExercise={addExercise}
    onResetSession={resetSession}
    onAddSetToExercise={addSetToExercise}
    onUpdateSet={updateSet}
    onRemoveSet={removeSet}
    onSaveWorkout={saveWorkout}
  />;
}

// Empty State Component (matches prototype's "Ready to Crush It?" design)
interface EmptyWorkoutStateProps {
  weightUnit: string;
  onAddExercise: (exercise: Exercise) => void;
}

function EmptyWorkoutState({ onAddExercise }: EmptyWorkoutStateProps) {
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const { setCurrentSidebarOption } = useNavigation();
  const insets = useSafeAreaInsets();
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSelectExercise = (exercise: Exercise) => {
    onAddExercise(exercise);
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

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button 
              onPress={() => setCurrentSidebarOption('routines')}
              variant="default"
              size="lg"
              style={[styles.actionButton, { backgroundColor: colors.accent }]}
            >
              <ThemedText style={[styles.buttonText, { color: colors.accentForeground }]}>
                Browse Routines
              </ThemedText>
            </Button>
            
            <Button 
              onPress={() => setShowExerciseModal(true)}
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
  weightUnit: string;
  onToggleWeightUnit: () => void;
  onAddExercise: (exercise: Exercise) => void;
  onResetSession: () => void;
  onAddSetToExercise: (exerciseId: string, weight: number, reps: number) => void;
  onUpdateSet: (exerciseId: string, setId: string, updates: any) => void; 
  onRemoveSet: (exerciseId: string, setId: string) => void; 
  onSaveWorkout: (exercises: WorkoutExercise[], duration: number, weightUnit: 'kg' | 'lbs', workoutName?: string) => Promise<SavedWorkout>;
}

function ActiveWorkoutState({ 
  exercises, 
  workoutStats, 
  weightUnit,
  onToggleWeightUnit,
  onAddExercise,
  onResetSession,
  onAddSetToExercise,
  onUpdateSet,
  onRemoveSet,
  onSaveWorkout
}: ActiveWorkoutStateProps) {
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const handleSelectExercise = (exercise: Exercise) => {
    onAddExercise(exercise);
  };

  const handleCancelWorkout = () => {
    onResetSession(); // Just reset, no timer.stop()
  };

  const handleSaveWorkout = async () => {
    try {
      // Save with 0 duration since we removed timer
      const savedWorkout = await onSaveWorkout(exercises, 0, weightUnit as 'kg' | 'lbs');
      
      onResetSession();
    } catch (error) {
      console.error('Failed to save workout:', error);
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
      {/* Workout Stats */}
      <Card style={[styles.statsCard, { backgroundColor: colors.card }]}>
        <CardContent style={styles.statsContent}>
          {/* Stats Row */}
          <View style={styles.statsRow}>
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
          </View>
          
          {/* Separate Actions Row */}
          <View style={styles.workoutActionsInline}>
            <TouchableOpacity 
              onPress={handleCancelWorkout}
              style={[
                styles.inlineActionButton,
                styles.cancelButton,
                { 
                  borderColor: colors.border,
                  backgroundColor: 'transparent'
                }
              ]}
            >
              <ThemedText style={[styles.buttonText, { color: colors.foreground }]}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleSaveWorkout}
              style={[
                styles.inlineActionButton,
                styles.saveButton,
                { 
                  backgroundColor: colors.accent,
                  borderColor: colors.accent
                }
              ]}
            >
              <ThemedText style={[styles.buttonText, { color: colors.accentForeground }]}>
                Save
              </ThemedText>
            </TouchableOpacity>
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
                            variant="destructive"
                            size="sm"
                            style={styles.removeSetButton}
                          >
                            <ThemedText style={[styles.removeSetText, { color: colors.destructiveForeground }]}>
                              Remove
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
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const categories = ['All', 'Full Body', 'Upper Body', 'Lower Body', 'Strength', 'Cardio', 'HIIT'];

  const allRoutines = getAllRoutines();
  
  // Filter routines based on selected category only
  const filteredRoutines = allRoutines.filter(routine => {
    const matchesCategory = selectedCategory === 'All' || routine.category === selectedCategory;
    return matchesCategory;
  });

  const handleStartRoutine = useCallback((routine: WorkoutRoutine | CustomRoutine) => {
    onStartRoutine(routine);
  }, [onStartRoutine]);

  const handleDuplicateRoutine = useCallback(async (routine: WorkoutRoutine | CustomRoutine) => {
    try {
      await duplicateRoutine(routine);
    } catch (error) {
      console.error('Failed to duplicate routine:', error);
    }
  }, [duplicateRoutine]);

  const handleDeleteRoutine = useCallback(async (routineId: string) => {
    try {
      await deleteCustomRoutine(routineId);
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

      {/* Category Filter Only */}
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

                {/* Simplified Stats (removed difficulty) */}
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
                      {routine.category}
                    </ThemedText>
                    <ThemedText style={[styles.routineStatLabel, { color: colors.mutedForeground }]}>
                      Category
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
    marginTop: 20,      // Reduce from 35 since no timer
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
  // REMOVE these timer styles from StyleSheet:

  // ACTION BUTTONS
  actionButtons: {
    width: '100%',             
    gap: 16,
    marginTop: 20,              
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

  statsCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  statsContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,                     // Reduce from 16 to 8
  },
  statItem: {
    alignItems: 'center',
    flex: 1,                    // Equal spacing
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
    marginBottom: 30,
    borderRadius: 12,
    paddingVertical: 0,
    paddingHorizontal: 20, 
    minHeight: 60,         
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',             
  },
  addExerciseText: {
    fontSize: 18,              
    fontWeight: '600',
    textAlign: 'center',       
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
    padding: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  exerciseMuscle: {
    fontSize: 14,
  },
  setsSection: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
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
    gap: 10,
  },
  setRow: {
    flexDirection: 'column',      // Stack vertically instead of row
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  setInputs: {
    flexDirection: 'row',
    gap: 16,                     // More space between wheels
  },
  inputGroup: {
    flex: 1,
    minHeight: 60,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  setActions: {
    alignItems: 'center', 
  },
  removeSetButton: {
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 0,
    minWidth: '50%',
  },
  removeSetText: {
    fontSize: 14,  
    fontWeight: '600',
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
    paddingTop: 15,
    paddingHorizontal: 16, 
    paddingBottom: 16,      
  },
  routinesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 0,
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
    marginTop: 10,
    marginBottom: 14,
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
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
    alignItems: 'center',  // This is correct
},

startButton: {
  flex: 1,
  marginRight: 12,      
  borderRadius: 8,
  paddingVertical: 8,    
  minHeight: 40,         
},

secondaryButton: {
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 8,   
  minHeight: 40,         
},

routineSecondaryActions: {
  flexDirection: 'row',
  gap: 8,
  alignItems: 'center',  // Add this for better alignment
},
  startButtonText: {
    fontSize: 13,
    fontWeight: '600',
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
  workoutActionsInline: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    paddingTop: 12,             // Increase from 4 to 12 for more space
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  inlineActionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,        
    minHeight: 44,              
    maxWidth: 120,
    justifyContent: 'center',   
    alignItems: 'center',
    borderWidth: 1,             // Add border to both buttons for consistency
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});