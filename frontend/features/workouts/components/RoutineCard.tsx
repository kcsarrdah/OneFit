import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { isCustomRoutine, type AnyRoutine } from '../lib/routines';
import { StatColumn } from './StatColumn';

/**
 * @file RoutineCard.tsx
 * @description One routine on the Routines screen: name, description, its
 * minutes / exercises / category, and Start, Duplicate and (custom only)
 * Delete actions.
 */

interface RoutineCardProps {
  routine: AnyRoutine;
  onStart: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function RoutineCard({ routine, onStart, onDuplicate, onDelete }: RoutineCardProps) {
  const colors = Colors.dark;
  const custom = isCustomRoutine(routine);
  const stat = (value: React.ReactNode, label: string) => (
    <StatColumn value={value} label={label} valueColor={colors.foreground} labelColor={colors.mutedForeground} />
  );

  return (
    <Card style={[styles.card, { backgroundColor: colors.card }]}>
      <CardContent style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={[styles.name, { color: colors.foreground }]}>
            {routine.name}
            {custom && <ThemedText style={[styles.customBadge, { color: colors.accent }]}>{' '}• Custom</ThemedText>}
          </ThemedText>
          <ThemedText style={[styles.description, { color: colors.mutedForeground }]}>
            {routine.description}
          </ThemedText>
        </View>

        <View style={styles.stats}>
          {stat(routine.estimatedDuration, 'Minutes')}
          {stat(routine.exercises.length, 'Exercises')}
          {stat(routine.category, 'Category')}
        </View>

        <View style={styles.actions}>
          <Button onPress={onStart} variant="default" size="sm" style={[styles.startButton, { backgroundColor: colors.accent }]}>
            <ThemedText style={[styles.startText, { color: colors.accentForeground }]}>Start Workout</ThemedText>
          </Button>

          <View style={styles.secondaryActions}>
            <Button onPress={onDuplicate} variant="outline" size="sm" style={styles.secondaryButton}>
              <ThemedText style={[styles.secondaryText, { color: colors.foreground }]}>Duplicate</ThemedText>
            </Button>
            {custom && (
              <Button onPress={onDelete} variant="ghost" size="sm" style={styles.deleteButton}>
                <ThemedText style={[styles.secondaryText, { color: colors.destructive }]}>Delete</ThemedText>
              </Button>
            )}
          </View>
        </View>
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16 },
  content: { padding: 16 },
  header: { marginTop: 10, marginBottom: 14 },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  customBadge: { fontSize: 14, fontWeight: '500' },
  description: { fontSize: 14, lineHeight: 20 },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  startButton: { flex: 1, marginRight: 12, borderRadius: 8, paddingVertical: 8, minHeight: 40 },
  startText: { fontSize: 13, fontWeight: '600' },
  secondaryActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  secondaryButton: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, minHeight: 40 },
  secondaryText: { fontSize: 12, fontWeight: '500' },
  deleteButton: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
});
