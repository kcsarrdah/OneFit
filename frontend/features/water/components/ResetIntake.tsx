import React, { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Colors } from '@/constants/Colors';

/**
 * @file ResetIntake.tsx
 * @description A quiet "Reset" text button for today's water, which asks for
 * confirmation before setting it back to 0 ml. Hidden while nothing is logged.
 */

interface ResetIntakeProps {
  intake: number;
  onReset: () => void;
}

export function ResetIntake({ intake, onReset }: ResetIntakeProps) {
  const colors = Colors.dark;
  const [confirming, setConfirming] = useState(false);

  if (intake <= 0) return null;

  return (
    <>
      <Pressable
        onPress={() => setConfirming(true)}
        accessibilityRole="button"
        accessibilityLabel="Reset water intake"
        hitSlop={8}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={[styles.text, { color: colors.mutedForeground }]}>Reset</Text>
      </Pressable>

      <ConfirmDialog
        visible={confirming}
        title="Reset water intake?"
        description={`Today's ${intake.toLocaleString()}ml goes back to 0ml.`}
        confirmLabel="Reset"
        onConfirm={() => {
          setConfirming(false);
          onReset();
        }}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: { height: 44, justifyContent: 'center', paddingLeft: 12 },
  pressed: { opacity: 0.6 },
  text: { fontSize: 14, fontWeight: '600' },
});
