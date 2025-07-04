import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { 
  EXERCISES, 
  MUSCLE_GROUPS, 
  EQUIPMENT_TYPES, 
  Exercise, 
  getExercisesByMuscleGroup 
} from '@/constants/workoutData';

interface ExerciseSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
}

export function ExerciseSelectionModal({ visible, onClose, onSelectExercise }: ExerciseSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Filter exercises based on search and filters
  const filteredExercises = EXERCISES.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscleGroup = !selectedMuscleGroup || exercise.muscleGroup === selectedMuscleGroup;
    const matchesEquipment = !selectedEquipment || exercise.equipment === selectedEquipment;
    
    return matchesSearch && matchesMuscleGroup && matchesEquipment;
  });

  const handleSelectExercise = (exercise: Exercise) => {
    onSelectExercise(exercise);
    onClose();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMuscleGroup(null);
    setSelectedEquipment(null);
  };

  console.log('Filtered exercises:', filteredExercises.length, filteredExercises.map(e => e.name));

  return (
    <Dialog visible={visible} onDismiss={onClose}>
      <DialogContent style={[styles.modalContent, { backgroundColor: colors.card }]}>
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
                >
                  <Badge
                    variant={selectedMuscleGroup === group ? 'default' : 'outline'}
                    style={[
                      styles.filterBadge,
                      selectedMuscleGroup === group && { backgroundColor: colors.accent }
                    ]}
                  >
                    {group}
                  </Badge>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
       

        {/* Clear Filters */}
        {(selectedMuscleGroup || selectedEquipment || searchQuery) && (
          <Button variant="outline" size="sm" onPress={clearFilters} style={styles.clearButton}>
            <Text style={{ color: colors.foreground }}>Clear Filters</Text>
          </Button>
        )}

        {/* Exercise List - TEMPORARY DEBUG VERSION */}
        <ScrollView style={styles.exerciseList} showsVerticalScrollIndicator={false}>
          {filteredExercises.length === 0 ? (
            <Text style={{ color: colors.foreground, padding: 20 }}>No exercises match your filters</Text>
          ) : (
            filteredExercises.map(exercise => (
              <TouchableOpacity 
                key={exercise.id} 
                onPress={() => handleSelectExercise(exercise)}
                style={{ 
                  backgroundColor: colors.secondary, 
                  padding: 15, 
                  marginBottom: 10, 
                  borderRadius: 8 
                }}
              >
                <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: 'bold' }}>
                  {exercise.name}
                </Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
                  {exercise.muscleGroup} • {exercise.equipment}
                </Text>
                <Text style={{ color: colors.accent, fontSize: 14, marginTop: 5 }}>
                  Tap to Add
                </Text>
              </TouchableOpacity>
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
    maxHeight: '80%',        // Reduce from '90%' to '80%'
    maxWidth: '95%',
    borderRadius: 16,
    padding: 16,             // Reduce padding from 20 to 16
  },
  modalTitle: {
    fontSize: 18,            // Reduce from 20
    fontWeight: 'bold',
    marginBottom: 12,        // Reduce from 16
  },
  searchSection: {
    marginBottom: 12,        // Reduce from 16
  },
  searchInput: {
    marginBottom: 0,
  },
  filterSection: {
    marginBottom: 8,         // Reduce from 12
  },
  filterTitle: {
    fontSize: 13,            // Reduce from 14
    fontWeight: '600',
    marginBottom: 6,         // Reduce from 8
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
    marginBottom: 12,        // Reduce from 16
  },
  exerciseList: {
    height:300,         // Add this - limit the list height
    marginBottom: 8,         // Reduce from 12
  },
  exerciseCard: {
    marginBottom: 8,
    borderRadius: 12,
  },
  exerciseCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsFooter: {
    alignItems: 'center',
    paddingTop: 8,
  },
  resultsText: {
    fontSize: 12,
  },
});