import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { EXERCISES, MUSCLE_GROUPS } from '../constants';
import { searchExercises } from '../lib/routines';
import type { Exercise } from '../types';

/**
 * @file ExerciseSelectionModal.tsx
 * @description Dialog to browse the exercise catalogue, searchable and
 * filtered by muscle group; tapping an exercise picks it and closes.
 * Not used by any screen yet.
 */

interface ExerciseSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
}

export function ExerciseSelectionModal({ visible, onClose, onSelectExercise }: ExerciseSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const colors = Colors.dark;
  const filteredExercises = searchExercises(EXERCISES, searchQuery, selectedMuscleGroup);

  const handleSelectExercise = (exercise: Exercise) => {
    onSelectExercise(exercise);
    onClose();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMuscleGroup(null);
  };

  return (
    <Dialog
      visible={visible}
      onDismiss={onClose}
    >
      <DialogContent style={[
        styles.modalContent,
        {
          backgroundColor: colors.card,
        }
      ]}>
        <DialogHeader>
          <DialogTitle style={[styles.modalTitle, { color: colors.foreground }]}>
            Browse Exercises
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <View style={styles.searchSection}>
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Muscle Group Filter */}
        <View style={styles.filterSection}>
          <ThemedText style={[styles.filterTitle, { color: colors.foreground }]}>
            Muscle Groups
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.filterRow}>
              {MUSCLE_GROUPS.map(group => (
                <TouchableOpacity
                  key={group}
                  onPress={() => setSelectedMuscleGroup(selectedMuscleGroup === group ? null : group)}
                  style={[
                    styles.filterBadge,
                    {
                      backgroundColor: selectedMuscleGroup === group ? colors.accent : colors.card,
                      borderWidth: 1,
                      borderColor: selectedMuscleGroup === group ? colors.accent : colors.border,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 16,
                    }
                  ]}
                >
                  <ThemedText style={{
                    color: selectedMuscleGroup === group ? colors.accentForeground : colors.foreground,
                    fontSize: 12,
                    fontWeight: '500'
                  }}>
                    {group}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>


        {/* Clear Filters */}
        {(selectedMuscleGroup || searchQuery) && (
          <Button variant="outline" size="sm" onPress={clearFilters} style={styles.clearButton}>
            <Text style={{ color: colors.foreground }}>Clear Filters</Text>
          </Button>
        )}

        {/* Exercise List */}
        <ScrollView style={styles.exerciseList} showsVerticalScrollIndicator={false}>
          {filteredExercises.length === 0 ? (
            <ThemedText style={[{ color: colors.foreground, padding: 20 }]}>
              No exercises match your filters
            </ThemedText>
          ) : (
            filteredExercises.map(exercise => (
              <Card key={exercise.id} style={[styles.exerciseCard, { backgroundColor: colors.card }]}>
                <TouchableOpacity onPress={() => handleSelectExercise(exercise)}>
                  <CardContent style={styles.exerciseCardContent}>
                    <View style={styles.exerciseInfo}>
                      <ThemedText style={[styles.exerciseName, { color: colors.foreground }]}>
                        {exercise.name}
                      </ThemedText>
                      <ThemedText style={[{ color: colors.mutedForeground, fontSize: 14 }]}>
                        {exercise.muscleGroup} • {exercise.equipment}
                      </ThemedText>
                    </View>
                  </CardContent>
                </TouchableOpacity>
              </Card>
            ))
          )}
        </ScrollView>

        {/* Results Count */}
        <View style={styles.resultsFooter}>
          <ThemedText style={[styles.resultsText, { color: colors.mutedForeground }]}>
            {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''} found
          </ThemedText>
        </View>
      </DialogContent>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    maxHeight: '100%',
    maxWidth: '100%',
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  searchSection: {
    marginBottom: 10,
  },
  filterSection: {
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  filterScroll: {
    marginBottom: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 2,
  },
  filterBadge: {
    marginRight: 0,
  },
  clearButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  exerciseList: {
    marginTop: 10,
    marginBottom: 12,
  },
  exerciseCard: {
    marginBottom: 10,
    borderRadius: 12,
  },
  exerciseCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 10,

  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultsFooter: {
    alignItems: 'center',
    paddingTop: 8,
  },
  resultsText: {
    fontSize: 12,
  },
});