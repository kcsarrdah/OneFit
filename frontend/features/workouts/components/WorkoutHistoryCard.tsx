import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { formatDuration, formatWorkoutDate } from '../lib/history';
import type { SavedWorkout } from '../types';
import { StatColumn } from './StatColumn';

/**
 * @file WorkoutHistoryCard.tsx
 * @description One saved workout on the History screen: name, date, duration,
 * exercises, sets and volume, the exercise names, and a delete button.
 */

interface WorkoutHistoryCardProps {
  workout: SavedWorkout;
  onDelete: () => void;
}

export function WorkoutHistoryCard({ workout, onDelete }: WorkoutHistoryCardProps) {
  const colors = Colors.dark;
  const stat = (value: React.ReactNode, label: string) => (
    <StatColumn
      size="sm"
      value={value}
      label={label}
      valueColor={colors.foreground}
      labelColor={colors.mutedForeground}
    />
  );

  return (
    <Card style={[styles.card, { backgroundColor: colors.card }]}>
      <CardContent style={styles.content}>
        <View style={styles.header}>
          <View style={styles.info}>
            <ThemedText style={[styles.name, { color: colors.foreground }]}>{workout.name}</ThemedText>
            <ThemedText style={[styles.date, { color: colors.mutedForeground }]}>
              {formatWorkoutDate(workout.date)}
            </ThemedText>
          </View>
          <View style={styles.actions}>
            <Button onPress={onDelete} variant="ghost" size="sm" style={styles.deleteButton}>
              <ThemedText style={[styles.deleteText, { color: colors.destructive }]}>✕</ThemedText>
            </Button>
          </View>
        </View>

        <View style={styles.stats}>
          {stat(formatDuration(workout.duration), 'Duration')}
          {stat(workout.exercises.length, 'Exercises')}
          {stat(`${workout.completedSets}/${workout.totalSets}`, 'Sets')}
          {stat(`${Math.round(workout.totalVolume)} ${workout.weightUnit}`, 'Volume')}
        </View>

        <View style={styles.summary}>
          <ThemedText style={[styles.summaryTitle, { color: colors.mutedForeground }]}>Exercises:</ThemedText>
          <ThemedText style={[styles.summaryText, { color: colors.foreground }]}>
            {workout.exercises.map((ex) => ex.exercise.name).join(', ')}
          </ThemedText>
        </View>
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16 },
  content: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  date: { fontSize: 14 },
  actions: { marginLeft: 12 },
  deleteButton: { width: 28, height: 28, borderRadius: 14, padding: 0, justifyContent: 'center', alignItems: 'center' },
  deleteText: { fontSize: 16, fontWeight: 'bold' },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  summary: { marginTop: 8 },
  summaryTitle: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  summaryText: { fontSize: 14, lineHeight: 18 },
});
