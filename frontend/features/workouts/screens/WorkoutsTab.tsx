import React from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation } from '@/contexts/NavigationContext';
import { useWorkoutSession } from '../hooks/useWorkoutSession';
import { ExercisesScreen } from './ExercisesScreen';
import { HistoryScreen } from './HistoryScreen';
import { RoutinesScreen } from './RoutinesScreen';
import { WorkoutScreen } from './WorkoutScreen';

/**
 * @file WorkoutsTab.tsx
 * @description The Workouts tab: shows the screen picked in the sidebar
 * (workout, routines, exercises, history). The session lives here so a
 * started routine carries over to the workout screen.
 */

export default function WorkoutsTab() {
  const { currentSidebarOption, setCurrentSidebarOption, focusMode } = useNavigation();
  const insets = useSafeAreaInsets();
  const session = useWorkoutSession();

  const renderContent = () => {
    switch (currentSidebarOption) {
      case 'routines':
        return (
          <RoutinesScreen
            onStartRoutine={(routine) => {
              session.addExercisesFromRoutine(routine.exercises);
              setCurrentSidebarOption('workout');
            }}
          />
        );
      case 'exercises':
        return <ExercisesScreen />;
      case 'workout-history':
        return <HistoryScreen />;
      case 'workout':
      default:
        return <WorkoutScreen session={session} />;
    }
  };

  // In focus mode the set logger is full screen and handles the safe area
  // itself, so the swipe bar and the accent flood reach the bottom edge.
  const paddingBottom = focusMode ? 0 : insets.bottom + 20;

  return <ThemedView style={[styles.container, { paddingBottom }]}>{renderContent()}</ThemedView>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
