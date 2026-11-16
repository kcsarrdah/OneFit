import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from './Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './Dialog';

/**
 * @file ConfirmDialog.tsx
 * @description "Are you sure?" for destructive actions: a title, what will
 * happen, Cancel and a red confirm button. Use it instead of Alert.alert,
 * which does nothing on web.
 */

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  description: string;
  /** Label of the destructive button, e.g. "Delete" or "Reset". */
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ visible, title, description, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog visible={visible} onDismiss={onCancel}>
      <DialogContent>
        <DialogHeader style={styles.header}>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <View style={styles.buttons}>
          <Button variant="outline" onPress={onCancel} containerStyle={styles.buttonWrap} style={styles.button}>
            Cancel
          </Button>
          <Button variant="destructive" onPress={onConfirm} containerStyle={styles.buttonWrap} style={styles.button}>
            {confirmLabel}
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 0 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  buttonWrap: { flex: 1 },
  button: { minHeight: 44 },
});
