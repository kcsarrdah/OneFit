import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNavigation } from '@/contexts/NavigationContext';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import { useWeightUnit } from '@/hooks/useWeightUnit';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EXERCISES, Exercise, WorkoutRoutine } from '@/constants/workoutData';
import { PickNext } from '@/components/workout/PickNext';
import { SetLogger } from '@/components/workout/SetLogger';
import { completedOnly, lastPerformance, nextOptions } from '@/constants/setLogging';
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
  const insets = useSafeAreaInsets();

  // Workout session hooks - shared across components
  const session = useWorkoutSession();

  // Render content based on selected sidebar option
  const renderContent = () => {
    switch (currentSidebarOption) {
      case 'routines':
        return <RoutinesScreen 
          onStartRoutine={(routine) => {
            // Add all exercises from routine to workout session
            session.addExercisesFromRoutine(routine.exercises);
            setCurrentSidebarOption('workout');
          }}
        />;
      case 'exercises':
        return <ExercisesScreen />;
      case 'workout-history':
        return <HistoryScreen />;
      case 'workout':
      default:
        return <WorkoutScreen session={session} />;
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
        {renderContent()}
    </ThemedView>

  );
}

// Main Workout Screen: swipe-to-log. "What's next?" lists your moves for a
// muscle group; picking one opens the set logger for it.
function WorkoutScreen({ session }: { session: ReturnType<typeof useWorkoutSession> }) {
  const { workoutHistory, saveWorkout } = useWorkoutHistory();
  const { weightUnit } = useWeightUnit();
  const [muscleGroup, setMuscleGroup] = useState<string | null>('Chest');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const { exercises, startTime, isLoading, startExercise, logSet, removeLastSet, resetSession } = session;
  const { setFocusMode } = useNavigation();
  const active = exercises.find((ex) => ex.id === activeId) ?? null;

  // Logging a set is full screen: hide the sidebar while it's open.
  const logging = active !== null;
  useEffect(() => {
    setFocusMode(logging);
    return () => setFocusMode(false);
  }, [logging, setFocusMode]);
  const setsLogged = exercises.reduce((n, ex) => n + ex.sets.filter((s) => s.completed).length, 0);

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    const catalog = q ? EXERCISES.filter((e) => e.name.toLowerCase().includes(q)) : EXERCISES;
    return nextOptions(catalog, workoutHistory, exercises, q ? null : muscleGroup);
  }, [query, muscleGroup, workoutHistory, exercises]);

  const finish = useCallback(async () => {
    const done = completedOnly(exercises);
    if (!done.length) return;
    const seconds = startTime ? Math.round((Date.now() - new Date(startTime).getTime()) / 1000) : 0;
    try {
      await saveWorkout(done, seconds, weightUnit);
      await resetSession();
      setActiveId(null);
    } catch (error) {
      console.error('Failed to save workout:', error);
    }
  }, [exercises, startTime, saveWorkout, resetSession, weightUnit]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText>Loading workout...</ThemedText>
      </View>
    );
  }

  if (active) {
    return (
      <SetLogger
        key={active.id}
        exercise={active.exercise}
        today={active.sets.filter((s) => s.completed)}
        last={lastPerformance(active.exercise.id, workoutHistory)}
        unit={weightUnit}
        onLog={(weight, reps) => logSet(active.id, weight, reps)}
        onUndo={() => removeLastSet(active.id)}
        onBack={() => setActiveId(null)}
      />
    );
  }

  return (
    <PickNext
      options={options}
      muscleGroup={muscleGroup}
      onMuscleGroup={setMuscleGroup}
      query={query}
      onQuery={setQuery}
      onPick={(exercise) => setActiveId(startExercise(exercise))}
      setsLogged={setsLogged}
      onFinish={finish}
    />
  );
}

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
  
  
  
  // CONTENT SPACING - Consistent margins
  
  // TIMER SECTION
  // REMOVE these timer styles from StyleSheet:

  // ACTION BUTTONS
  
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

  statsCard: {
    marginBottom: 16,
    borderRadius: 16,
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
});