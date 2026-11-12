import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';

/**
 * @file Stepper.tsx
 * @description A − / + pill for nudging a number by a fixed step, with the
 * step shown in the middle ("2.5 kg", "1 rep").
 *
 * Usage:
 *   <Stepper step="2.5 kg" name="weight" onDecrement={...} onIncrement={...} />
 */

interface StepperProps {
  /** What one tap changes, shown between the buttons. */
  step: string;
  /** Used in the buttons' accessible names: "Less weight", "More weight". */
  name: string;
  onDecrement: () => void;
  onIncrement: () => void;
}

export function Stepper({ step, name, onDecrement, onIncrement }: StepperProps) {
  const colors = Colors.dark;
  const tap = (fn: () => void) => () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    fn();
  };
  const button = ({ pressed }: { pressed: boolean }) => [
    styles.button,
    { backgroundColor: pressed ? colors.input : colors.secondary },
  ];

  return (
    <View style={[styles.pill, { backgroundColor: colors.card }]}>
      <Pressable onPress={tap(onDecrement)} style={button} accessibilityRole="button" accessibilityLabel={`Less ${name}`}>
        <IconSymbol name="minus" size={24} color={colors.foreground} />
      </Pressable>
      <Text style={[styles.step, { color: colors.mutedForeground }]}>{step}</Text>
      <Pressable onPress={tap(onIncrement)} style={button} accessibilityRole="button" accessibilityLabel={`More ${name}`}>
        <IconSymbol name="plus" size={24} color={colors.foreground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 28,
    padding: 4,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: {
    fontSize: 13,
    fontWeight: '600',
  },
});
