import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { EXERCISES, MUSCLE_GROUPS } from '../constants';
import { searchExercises } from '../lib/routines';
import type { Exercise } from '../types';

/**
 * @file RoutineExercisesStep.tsx
 * @description Step 2 of "Create custom routine": the exercises picked so far
 * (tap × to remove) and the catalogue to add from, searchable and filtered by
 * muscle group.
 */

interface RoutineExercisesStepProps {
  selected: Exercise[];
  onAdd: (exercise: Exercise) => void;
  onRemove: (exerciseId: string) => void;
  searchQuery: string;
  onSearchQuery: (query: string) => void;
  muscleGroup: string | null;
  onMuscleGroup: (group: string | null) => void;
}

export function RoutineExercisesStep({
  selected,
  onAdd,
  onRemove,
  searchQuery,
  onSearchQuery,
  muscleGroup,
  onMuscleGroup,
}: RoutineExercisesStepProps) {
  const colors = Colors.dark;
  const available = searchExercises(EXERCISES, searchQuery, muscleGroup, selected);

  const details = (exercise: Exercise) => (
    <View style={styles.exerciseInfo}>
      <ThemedText style={[styles.exerciseName, { color: colors.foreground }]}>{exercise.name}</ThemedText>
      <ThemedText style={[styles.exerciseDetails, { color: colors.mutedForeground }]}>
        {exercise.muscleGroup} • {exercise.equipment}
      </ThemedText>
    </View>
  );

  const chip = (group: string | null, onPress: () => void) => (
    <TouchableOpacity key={group ?? 'all'} onPress={onPress}>
      <Badge
        variant={muscleGroup === group ? 'default' : 'outline'}
        style={[styles.filterBadge, muscleGroup === group && { backgroundColor: colors.accent }]}
      >
        {group ?? 'All'}
      </Badge>
    </TouchableOpacity>
  );

  return (
    <View style={styles.step}>
      <ThemedText style={[styles.stepTitle, { color: colors.foreground }]}>
        Step 2: Select Exercises ({selected.length} selected)
      </ThemedText>

      {selected.length > 0 && (
        <View style={styles.selected}>
          <ThemedText style={[styles.sectionTitle, { color: colors.foreground }]}>Selected Exercises</ThemedText>
          {selected.map((exercise) => (
            <Card key={exercise.id} style={[styles.selectedCard, { backgroundColor: colors.secondary }]}>
              <CardContent style={styles.selectedContent}>
                {details(exercise)}
                <TouchableOpacity onPress={() => onRemove(exercise.id)} style={styles.removeButton}>
                  <ThemedText style={[styles.removeText, { color: colors.destructive }]}>×</ThemedText>
                </TouchableOpacity>
              </CardContent>
            </Card>
          ))}
        </View>
      )}

      <View style={styles.selection}>
        <ThemedText style={[styles.sectionTitle, { color: colors.foreground }]}>Add Exercises</ThemedText>
        <Input placeholder="Search exercises..." value={searchQuery} onChangeText={onSearchQuery} />

        <View style={styles.muscleGroupFilter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {chip(null, () => onMuscleGroup(null))}
              {MUSCLE_GROUPS.map((group) => chip(group, () => onMuscleGroup(muscleGroup === group ? null : group)))}
            </View>
          </ScrollView>
        </View>

        <ScrollView style={styles.exerciseList}>
          {available.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              onPress={() => onAdd(exercise)}
              style={[styles.exerciseItem, { backgroundColor: colors.background }]}
            >
              {details(exercise)}
              <IconSymbol name="plus.circle.fill" size={16} color={colors.accent} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  step: { marginBottom: 16 },
  stepTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  selected: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  selectedCard: { marginBottom: 8 },
  selectedContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 14, fontWeight: '600' },
  exerciseDetails: { fontSize: 12, marginTop: 2 },
  removeButton: { padding: 4 },
  removeText: { fontSize: 18, fontWeight: 'bold' },
  selection: { marginBottom: 16 },
  muscleGroupFilter: { marginBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterBadge: { marginRight: 8 },
  exerciseList: { maxHeight: 200 },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
});
