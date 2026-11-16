import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Colors } from '@/constants/Colors';
import type { Exercise, NewRoutine } from '../types';
import { RoutineDetailsStep, type RoutineDetails } from './RoutineDetailsStep';
import { RoutineExercisesStep } from './RoutineExercisesStep';

/**
 * @file CreateCustomRoutineModal.tsx
 * @description Two-step dialog for a custom routine: details, then exercises.
 * Everything resets when it closes.
 */

interface CreateCustomRoutineModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateRoutine: (routine: NewRoutine) => Promise<void>;
}

const EMPTY_DETAILS: RoutineDetails = {
  name: '',
  description: '',
  estimatedDuration: 30,
  difficulty: 'Beginner',
  category: 'Full Body',
};

export function CreateCustomRoutineModal({ visible, onClose, onCreateRoutine }: CreateCustomRoutineModalProps) {
  const [details, setDetails] = useState<RoutineDetails>(EMPTY_DETAILS);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<string | null>(null);
  const colors = Colors.dark;

  const handleClose = () => {
    setDetails(EMPTY_DETAILS);
    setSelectedExercises([]);
    setCurrentStep(1);
    setSearchQuery('');
    setMuscleGroup(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!details.name.trim()) {
      alert('Please enter a routine name');
      return;
    }
    if (selectedExercises.length === 0) {
      alert('Please select at least one exercise');
      return;
    }
    try {
      setIsLoading(true);
      await onCreateRoutine({
        ...details,
        name: details.name.trim(),
        description: details.description.trim(),
        exercises: selectedExercises,
      });
      handleClose();
    } catch (error) {
      console.error('Failed to create routine:', error);
      alert('Failed to create routine. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = details.name.trim() && selectedExercises.length > 0;

  const footerButton = (label: string, onPress: () => void, primary: boolean, disabled?: boolean) => (
    <Button
      variant={primary ? 'default' : 'outline'}
      onPress={onPress}
      style={[styles.footerButton, primary && { backgroundColor: colors.accent }]}
      disabled={disabled}
    >
      <ThemedText style={{ color: primary ? colors.accentForeground : colors.foreground }}>{label}</ThemedText>
    </Button>
  );

  return (
    <Dialog visible={visible} onDismiss={handleClose}>
      <DialogContent style={[styles.modalContent, { backgroundColor: colors.card }]}>
        <DialogHeader>
          <DialogTitle style={[styles.modalTitle, { color: colors.foreground }]}>Create Custom Routine</DialogTitle>
        </DialogHeader>

        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          {currentStep === 1 ? (
            <RoutineDetailsStep details={details} onChange={(patch) => setDetails((d) => ({ ...d, ...patch }))} />
          ) : (
            <RoutineExercisesStep
              selected={selectedExercises}
              onAdd={(exercise) => setSelectedExercises((prev) => [...prev, exercise])}
              onRemove={(id) => setSelectedExercises((prev) => prev.filter((e) => e.id !== id))}
              searchQuery={searchQuery}
              onSearchQuery={setSearchQuery}
              muscleGroup={muscleGroup}
              onMuscleGroup={setMuscleGroup}
            />
          )}
        </ScrollView>

        <DialogFooter>
          <View style={styles.footer}>
            {currentStep === 1 ? (
              <View style={styles.footerButtons}>
                {footerButton('Cancel', handleClose, false)}
                {footerButton('Next', () => setCurrentStep(2), true, !details.name.trim())}
              </View>
            ) : (
              <View style={styles.footerButtons}>
                {footerButton('Back', () => setCurrentStep(1), false)}
                {footerButton(isLoading ? 'Creating...' : 'Create Routine', handleSubmit, true, !isFormValid || isLoading)}
              </View>
            )}
          </View>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  modalContent: { maxHeight: '85%', maxWidth: '95%', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  formContainer: { maxHeight: 400 },
  footer: { marginTop: 16 },
  footerButtons: { flexDirection: 'row', gap: 12 },
  footerButton: { flex: 1 },
});
