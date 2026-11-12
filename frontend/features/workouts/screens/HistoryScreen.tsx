import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { Card, CardContent } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { CenteredMessage } from '../components/CenteredMessage';
import { StatColumn } from '../components/StatColumn';
import { WorkoutHistoryCard } from '../components/WorkoutHistoryCard';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';

/**
 * @file HistoryScreen.tsx
 * @description Overall progress (workouts, minutes, volume) and every saved
 * workout, newest first.
 */

export function HistoryScreen() {
  const { workoutHistory, isLoading, overallStats, deleteWorkout } = useWorkoutHistory();
  const colors = Colors.dark;
  const insets = useSafeAreaInsets();

  if (isLoading) return <CenteredMessage body="Loading workout history..." />;

  if (workoutHistory.length === 0) {
    return (
      <CenteredMessage
        title="No Workouts Yet"
        body="Complete your first workout to see it here!"
        titleColor={colors.foreground}
        bodyColor={colors.mutedForeground}
      />
    );
  }

  const stat = (value: number, label: string) => (
    <StatColumn size="lg" value={value} label={label} valueColor={colors.accent} labelColor={colors.mutedForeground} />
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
      <Card style={[styles.statsCard, { backgroundColor: colors.card }]}>
        <CardContent style={styles.statsContent}>
          <ThemedText style={[styles.statsTitle, { color: colors.foreground }]}>Your Progress</ThemedText>
          <View style={styles.statsGrid}>
            {stat(overallStats.totalWorkouts, 'Workouts')}
            {stat(Math.round(overallStats.totalDuration / 60), 'Total Minutes')}
            {stat(Math.round(overallStats.totalVolume), 'Total Volume')}
          </View>
        </CardContent>
      </Card>

      <View style={styles.list}>
        {workoutHistory.map((workout) => (
          <WorkoutHistoryCard key={workout.id} workout={workout} onDelete={() => deleteWorkout(workout.id)} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  statsCard: { marginBottom: 16, borderRadius: 16 },
  statsContent: { padding: 16 },
  statsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  list: { marginTop: 16, gap: 12 },
});
