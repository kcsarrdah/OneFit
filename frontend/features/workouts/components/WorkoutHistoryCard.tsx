import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { formatWorkoutDay, formatWorkoutSummary } from '../lib/history';
import type { SavedWorkout } from '../types';

/**
 * @file WorkoutHistoryCard.tsx
 * @description One saved workout on the History screen, as a row: name and
 * day, its numbers on one Oswald line (minutes, sets, volume), the exercises
 * on one muted line, and a quiet × that asks before deleting.
 */

interface WorkoutHistoryCardProps {
  workout: SavedWorkout;
  onDelete: () => void;
}

export function WorkoutHistoryCard({ workout, onDelete }: WorkoutHistoryCardProps) {
  const colors = Colors.dark;
  const [confirming, setConfirming] = useState(false);
  const day = formatWorkoutDay(workout.date);

  return (
    <View style={[styles.row, { backgroundColor: colors.card }]}>
      <View style={styles.text}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {workout.name}
        </Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>{day}</Text>
        <Text style={[styles.numbers, { color: colors.foreground }]}>{formatWorkoutSummary(workout)}</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]} numberOfLines={1}>
          {workout.exercises.map((ex) => ex.exercise.name).join(', ')}
        </Text>
      </View>

      <Pressable
        onPress={() => setConfirming(true)}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${workout.name}`}
        style={({ pressed }) => [styles.delete, pressed && { backgroundColor: colors.secondary }]}
      >
        <IconSymbol name="xmark" size={16} color={colors.icon} />
      </Pressable>

      <ConfirmDialog
        visible={confirming}
        title="Delete workout?"
        description={`${workout.name} (${day}) will be removed from your history. This can't be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          setConfirming(false);
          onDelete();
        }}
        onCancel={() => setConfirming(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    borderRadius: 18,
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 6,
  },
  text: { flex: 1, minWidth: 0 },
  name: { fontSize: 16, fontWeight: '600' },
  sub: { marginTop: 3, fontSize: 13 },
  numbers: {
    marginTop: 10,
    fontFamily: Fonts.display,
    fontSize: 17,
    letterSpacing: 0.6,
    fontVariant: ['tabular-nums'],
  },
  delete: { width: 44, height: 44, marginTop: -8, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
