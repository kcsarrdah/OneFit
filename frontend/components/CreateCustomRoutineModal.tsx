import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { NumberInput } from '@/components/ui/NumberInput';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { 
  EXERCISES, 
  MUSCLE_GROUPS, 
  Exercise,
  WorkoutRoutine 
} from '@/constants/workoutData';

interface CreateCustomRoutineModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateRoutine: (
    name: string,
    description: string,
    exercises: Exercise[],
    estimatedDuration: number,
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
    category: 'Strength' | 'Cardio' | 'HIIT' | 'Full Body' | 'Upper Body' | 'Lower Body'
  ) => Promise<void>;
}

export function CreateCustomRoutineModal({ 
  visible, 
  onClose, 
  onCreateRoutine 
}: CreateCustomRoutineModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [estimatedDuration, setEstimatedDuration] = useState(30);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [category, setCategory] = useState<'Strength' | 'Cardio' | 'HIIT' | 'Full Body' | 'Upper Body' | 'Lower Body'>('Full Body');
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Exercise selection state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Filter exercises for selection
  const filteredExercises = EXERCISES.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscleGroup = !selectedMuscleGroup || exercise.muscleGroup === selectedMuscleGroup;
    const notAlreadySelected = !selectedExercises.find(e => e.id === exercise.id);
    
    return matchesSearch && matchesMuscleGroup && notAlreadySelected;
  });

  const handleAddExercise = (exercise: Exercise) => {
    setSelectedExercises(prev => [...prev, exercise]);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(prev => prev.filter(e => e.id !== exerciseId));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Please enter a routine name');
      return;
    }
    
    if (selectedExercises.length === 0) {
      alert('Please select at least one exercise');
      return;
    }

    try {
      setIsLoading(true);
      await onCreateRoutine(
        name.trim(),
        description.trim(),
        selectedExercises,
        estimatedDuration,
        difficulty,
        category
      );
      handleClose();
    } catch (error) {
      console.error('Failed to create routine:', error);
      alert('Failed to create routine. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setName('');
    setDescription('');
    setSelectedExercises([]);
    setEstimatedDuration(30);
    setDifficulty('Beginner');
    setCategory('Full Body');
    setCurrentStep(1);
    setSearchQuery('');
    setSelectedMuscleGroup(null);
    onClose();
  };

  const isFormValid = name.trim() && selectedExercises.length > 0;

  return (
    <Dialog visible={visible} onDismiss={handleClose}>
      <DialogContent style={[styles.modalContent, { backgroundColor: colors.card }]}>
        <DialogHeader>
          <DialogTitle style={[styles.modalTitle, { color: colors.foreground }]}>
            Create Custom Routine
          </DialogTitle>
        </DialogHeader>

        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          {currentStep === 1 && (
            <View style={styles.step}>
              <ThemedText style={[styles.stepTitle, { color: colors.foreground }]}>
                Step 1: Basic Information
              </ThemedText>
              
              <View style={styles.field}>
                <ThemedText style={[styles.label, { color: colors.foreground }]}>
                  Routine Name *
                </ThemedText>
                <Input
                  placeholder="Enter routine name"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.field}>
                <ThemedText style={[styles.label, { color: colors.foreground }]}>
                  Description
                </ThemedText>
                <Textarea
                  placeholder="Describe your routine..."
                  value={description}
                  onChangeText={setDescription}
                  numberOfLines={3}
                />
              </View>

              <View style={styles.field}>
                <ThemedText style={[styles.label, { color: colors.foreground }]}>
                  Estimated Duration (minutes)
                </ThemedText>
                <NumberInput
                  value={estimatedDuration}
                  onValueChange={setEstimatedDuration}
                  min={5}
                  max={180}
                  step={5}
                  style={styles.numberInput}
                />
              </View>

              <View style={styles.field}>
                <ThemedText style={[styles.label, { color: colors.foreground }]}>
                  Difficulty
                </ThemedText>
                <RadioGroup
                  value={difficulty}
                  onValueChange={(value) => setDifficulty(value as 'Beginner' | 'Intermediate' | 'Advanced')}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <RadioGroupItem value="Beginner" />
                    <ThemedText style={{ color: colors.foreground, marginLeft: 8 }}>Beginner</ThemedText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <RadioGroupItem value="Intermediate" />
                    <ThemedText style={{ color: colors.foreground, marginLeft: 8 }}>Intermediate</ThemedText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <RadioGroupItem value="Advanced" />
                    <ThemedText style={{ color: colors.foreground, marginLeft: 8 }}>Advanced</ThemedText>
                  </View>
                </RadioGroup>
              </View>

              <View style={styles.field}>
                <ThemedText style={[styles.label, { color: colors.foreground }]}>
                  Category
                </ThemedText>
                <RadioGroup
                  value={category}
                  onValueChange={(value) => setCategory(value as 'Strength' | 'Cardio' | 'HIIT' | 'Full Body' | 'Upper Body' | 'Lower Body')}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <RadioGroupItem value="Full Body" />
                    <ThemedText style={{ color: colors.foreground, marginLeft: 8 }}>Full Body</ThemedText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <RadioGroupItem value="Upper Body" />
                    <ThemedText style={{ color: colors.foreground, marginLeft: 8 }}>Upper Body</ThemedText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <RadioGroupItem value="Lower Body" />
                    <ThemedText style={{ color: colors.foreground, marginLeft: 8 }}>Lower Body</ThemedText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <RadioGroupItem value="Strength" />
                    <ThemedText style={{ color: colors.foreground, marginLeft: 8 }}>Strength</ThemedText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <RadioGroupItem value="Cardio" />
                    <ThemedText style={{ color: colors.foreground, marginLeft: 8 }}>Cardio</ThemedText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <RadioGroupItem value="HIIT" />
                    <ThemedText style={{ color: colors.foreground, marginLeft: 8 }}>HIIT</ThemedText>
                  </View>
                </RadioGroup>
              </View>
            </View>
          )}

          {currentStep === 2 && (
            <View style={styles.step}>
              <ThemedText style={[styles.stepTitle, { color: colors.foreground }]}>
                Step 2: Select Exercises ({selectedExercises.length} selected)
              </ThemedText>

              {/* Selected Exercises */}
              {selectedExercises.length > 0 && (
                <View style={styles.selectedExercises}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.foreground }]}>
                    Selected Exercises
                  </ThemedText>
                  {selectedExercises.map(exercise => (
                    <Card key={exercise.id} style={[styles.selectedExerciseCard, { backgroundColor: colors.secondary }]}>
                      <CardContent style={styles.selectedExerciseContent}>
                        <View style={styles.exerciseInfo}>
                          <ThemedText style={[styles.exerciseName, { color: colors.foreground }]}>
                            {exercise.name}
                          </ThemedText>
                          <ThemedText style={[styles.exerciseDetails, { color: colors.mutedForeground }]}>
                            {exercise.muscleGroup} • {exercise.equipment}
                          </ThemedText>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleRemoveExercise(exercise.id)}
                          style={styles.removeButton}
                        >
                          <ThemedText style={{ color: colors.destructive, fontSize: 18, fontWeight: 'bold' }}>×</ThemedText>
                        </TouchableOpacity>
                      </CardContent>
                    </Card>
                  ))}
                </View>
              )}

              {/* Exercise Search & Selection */}
              <View style={styles.exerciseSelection}>
                <ThemedText style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Add Exercises
                </ThemedText>
                
                <Input
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />

                <View style={styles.muscleGroupFilter}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.filterRow}>
                      <TouchableOpacity
                        onPress={() => setSelectedMuscleGroup(null)}
                      >
                        <Badge
                          variant={selectedMuscleGroup === null ? 'default' : 'outline'}
                          style={[
                            styles.filterBadge,
                            selectedMuscleGroup === null && { backgroundColor: colors.accent }
                          ]}
                        >
                          All
                        </Badge>
                      </TouchableOpacity>
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

                <ScrollView style={styles.exerciseList}>
                  {filteredExercises.map(exercise => (
                    <TouchableOpacity
                      key={exercise.id}
                      onPress={() => handleAddExercise(exercise)}
                      style={[styles.exerciseItem, { backgroundColor: colors.background }]}
                    >
                      <View style={styles.exerciseInfo}>
                        <ThemedText style={[styles.exerciseName, { color: colors.foreground }]}>
                          {exercise.name}
                        </ThemedText>
                        <ThemedText style={[styles.exerciseDetails, { color: colors.mutedForeground }]}>
                          {exercise.muscleGroup} • {exercise.equipment}
                        </ThemedText>
                      </View>
                      <IconSymbol name="plus.circle.fill" size={16} color={colors.accent} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}
        </ScrollView>

        <DialogFooter>
          <View style={styles.footer}>
            {currentStep === 1 ? (
              <View style={styles.footerButtons}>
                <Button
                  variant="outline"
                  onPress={handleClose}
                  style={styles.footerButton}
                >
                  <ThemedText style={{ color: colors.foreground }}>Cancel</ThemedText>
                </Button>
                <Button
                  variant="default"
                  onPress={() => setCurrentStep(2)}
                  style={[styles.footerButton, { backgroundColor: colors.accent }]}
                  disabled={!name.trim()}
                >
                  <ThemedText style={{ color: colors.accentForeground }}>Next</ThemedText>
                </Button>
              </View>
            ) : (
              <View style={styles.footerButtons}>
                <Button
                  variant="outline"
                  onPress={() => setCurrentStep(1)}
                  style={styles.footerButton}
                >
                  <ThemedText style={{ color: colors.foreground }}>Back</ThemedText>
                </Button>
                <Button
                  variant="default"
                  onPress={handleSubmit}
                  style={[styles.footerButton, { backgroundColor: colors.accent }]}
                  disabled={!isFormValid || isLoading}
                >
                  <ThemedText style={{ color: colors.accentForeground }}>
                    {isLoading ? 'Creating...' : 'Create Routine'}
                  </ThemedText>
                </Button>
              </View>
            )}
          </View>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    maxHeight: '85%',
    maxWidth: '95%',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formContainer: {
    maxHeight: 400,
  },
  step: {
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    marginBottom: 0,
  },
  textarea: {
    marginBottom: 0,
  },
  numberInput: {
    marginBottom: 0,
  },
  selectedExercises: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  selectedExerciseCard: {
    marginBottom: 8,
  },
  selectedExerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseDetails: {
    fontSize: 12,
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  exerciseSelection: {
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 12,
  },
  muscleGroupFilter: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterBadge: {
    marginRight: 8,
  },
  exerciseList: {
    maxHeight: 200,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  footer: {
    marginTop: 16,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
}); 