import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Colors } from '@/constants/Colors';
import { formatHoursMinutes } from '../lib/format';
import type { CompletedFastData } from '../types';

/**
 * @file FastCompleteDialog.tsx
 * @description Shown when a fast ends: its length, whether the goal was hit,
 * optional notes, and Save / Discard.
 */

interface FastCompleteDialogProps {
  visible: boolean;
  fast: CompletedFastData | null;
  notes: string;
  onNotes: (notes: string) => void;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onDismiss: () => void;
}

export function FastCompleteDialog({
  visible,
  fast,
  notes,
  onNotes,
  saving,
  onSave,
  onDiscard,
  onDismiss,
}: FastCompleteDialogProps) {
  const colors = Colors.dark;

  return (
    <Dialog visible={visible} onDismiss={onDismiss}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fast Complete!</DialogTitle>
          <DialogDescription>
            {fast && (
              <>
                Duration: {formatHoursMinutes(fast.actualDurationSeconds)}
                {fast.actualDurationSeconds >= fast.goalDurationSeconds ? ' 🎉 Goal achieved!' : ' (Early completion)'}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <View style={styles.content}>
          <Text style={[styles.label, { color: colors.foreground }]}>Notes (optional):</Text>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            value={notes}
            onChangeText={onNotes}
            placeholder="How did your fast go?"
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
          />
        </View>
        <View style={styles.buttons}>
          <Button variant="outline" onPress={onDiscard} style={styles.button} disabled={saving}>
            <Text style={{ color: colors.foreground }}>Discard</Text>
          </Button>
          <Button onPress={onSave} style={[styles.button, { backgroundColor: colors.accent }]} disabled={saving}>
            <Text style={{ color: colors.accentForeground }}>{saving ? 'Saving...' : 'Save Fast'}</Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  content: { marginVertical: 16 },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, minHeight: 80, textAlignVertical: 'top' },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
  },
  button: { flex: 1, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
});
