import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation } from '@/contexts/NavigationContext';
import { PickNext } from '../components/PickNext';
import { SetLogger } from '../components/SetLogger';
import { EXERCISES } from '../constants';
import { useWeightUnit } from '../hooks/useWeightUnit';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import type { useWorkoutSession } from '../hooks/useWorkoutSession';
import { setsLogged } from '../lib/session';
import { completedOnly, lastPerformance, nextOptions } from '../lib/setLogging';

/**
 * @file WorkoutScreen.tsx
 * @description Swipe-to-log. "What's next?" lists your moves for a muscle
 * group; picking one opens the set logger for it, full screen.
 */

interface WorkoutScreenProps {
  session: ReturnType<typeof useWorkoutSession>;
}

export function WorkoutScreen({ session }: WorkoutScreenProps) {
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
      <View style={styles.loading}>
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
      setsLogged={setsLogged(exercises)}
      onFinish={finish}
    />
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
