import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors, WaterColors } from '@/constants/Colors';

/**
 * @file HydrationActions.tsx
 * @description The round "+250ml" drop button and, once something is logged,
 * a Reset button that asks for confirmation first.
 */

interface HydrationActionsProps {
  intake: number;
  logAmount: number;
  onLog: () => void;
  onReset: () => void;
}

export function HydrationActions({ intake, logAmount, onLog, onReset }: HydrationActionsProps) {
  const colors = Colors.dark;

  const [confirming, setConfirming] = useState(false);

  return (
    <View style={styles.area}>
      <Button
        onPress={onLog}
        accessibilityLabel={`Log ${logAmount} millilitres`}
        style={[
          styles.addButton,
          { backgroundColor: colors.card, borderColor: WaterColors.primary, shadowColor: WaterColors.primary },
        ]}
      >
        <IconSymbol name="drop.fill" size={28} color={WaterColors.primary} />
      </Button>
      <Text style={[styles.addLabel, { color: WaterColors.primary }]}>+{logAmount}ml</Text>

      {intake > 0 && (
        <>
          <Button
            onPress={() => setConfirming(true)}
            accessibilityLabel="Reset water intake"
            style={[styles.resetButton, { backgroundColor: colors.card, borderColor: colors.destructive }]}
          >
            <IconSymbol name="arrow.counterclockwise" size={20} color={colors.destructive} />
          </Button>
          <Text style={[styles.resetLabel, { color: colors.destructive }]}>Reset</Text>
        </>
      )}

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
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addLabel: { position: 'absolute', top: 90, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  resetButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  resetLabel: { position: 'absolute', top: 70, fontSize: 12, fontWeight: '500', textAlign: 'center' },
});
