import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Input } from '@/components/ui/Input';
import { NumberInput } from '@/components/ui/NumberInput';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { Textarea } from '@/components/ui/Textarea';
import { Colors } from '@/constants/Colors';
import { ROUTINE_CATEGORIES, ROUTINE_DIFFICULTIES } from '../constants';
import type { NewRoutine } from '../types';

/**
 * @file RoutineDetailsStep.tsx
 * @description Step 1 of "Create custom routine": name, description,
 * estimated minutes, difficulty and category.
 */

export type RoutineDetails = Omit<NewRoutine, 'exercises'>;

interface RoutineDetailsStepProps {
  details: RoutineDetails;
  onChange: (patch: Partial<RoutineDetails>) => void;
}

export function RoutineDetailsStep({ details, onChange }: RoutineDetailsStepProps) {
  const colors = Colors.dark;
  const label = (text: string) => (
    <ThemedText style={[styles.label, { color: colors.foreground }]}>{text}</ThemedText>
  );
  const radios = (options: readonly string[]) =>
    options.map((option) => (
      <View key={option} style={styles.radioRow}>
        <RadioGroupItem value={option} />
        <ThemedText style={[styles.radioLabel, { color: colors.foreground }]}>{option}</ThemedText>
      </View>
    ));

  return (
    <View style={styles.step}>
      <ThemedText style={[styles.stepTitle, { color: colors.foreground }]}>Step 1: Basic Information</ThemedText>

      <View style={styles.field}>
        {label('Routine Name *')}
        <Input placeholder="Enter routine name" value={details.name} onChangeText={(name) => onChange({ name })} />
      </View>

      <View style={styles.field}>
        {label('Description')}
        <Textarea
          placeholder="Describe your routine..."
          value={details.description}
          onChangeText={(description) => onChange({ description })}
          numberOfLines={3}
        />
      </View>

      <View style={styles.field}>
        {label('Estimated Duration (minutes)')}
        <NumberInput
          value={details.estimatedDuration}
          onValueChange={(estimatedDuration) => onChange({ estimatedDuration })}
          min={5}
          max={180}
          step={5}
          style={styles.numberInput}
        />
      </View>

      <View style={styles.field}>
        {label('Difficulty')}
        <RadioGroup
          value={details.difficulty}
          onValueChange={(value) => onChange({ difficulty: value as RoutineDetails['difficulty'] })}
        >
          {radios(ROUTINE_DIFFICULTIES)}
        </RadioGroup>
      </View>

      <View style={styles.field}>
        {label('Category')}
        <RadioGroup
          value={details.category}
          onValueChange={(value) => onChange({ category: value as RoutineDetails['category'] })}
        >
          {radios(ROUTINE_CATEGORIES)}
        </RadioGroup>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  step: { marginBottom: 16 },
  stepTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  numberInput: { marginBottom: 0 },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  radioLabel: { marginLeft: 8 },
});
