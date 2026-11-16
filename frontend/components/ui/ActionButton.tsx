import React from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';

/**
 * @file ActionButton.tsx
 * @description A screen's one primary action: a 64 pt accent pill with an
 * Oswald label, placed at the bottom within thumb reach. `inverted` is the
 * version for the accent flood: near-black fill, orange label.
 */

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  inverted?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function ActionButton({ label, onPress, inverted = false, disabled = false, accessibilityLabel, style }: ActionButtonProps) {
  const colors = Colors.dark;
  const fill = inverted ? colors.background : colors.accent;
  const ink = inverted ? colors.accent : colors.accentForeground;

  const press = () => {
    if (process.env.EXPO_OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPress={press}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: fill, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, { color: ink }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 64,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  pressed: { transform: [{ scale: 0.98 }] },
  label: {
    fontFamily: Fonts.display,
    fontSize: 21,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
