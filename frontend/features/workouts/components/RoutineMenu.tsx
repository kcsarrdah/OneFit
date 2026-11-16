import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';

/**
 * @file RoutineMenu.tsx
 * @description The ⋯ menu of a routine: Duplicate and, for custom routines,
 * Delete. Delete turns the same dialog into "Delete routine?" with Cancel and
 * a red Delete, so two modals never stack.
 */

interface RoutineMenuProps {
  visible: boolean;
  routineName: string;
  canDelete: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function RoutineMenu({ visible, routineName, canDelete, onDuplicate, onDelete, onClose }: RoutineMenuProps) {
  const [confirming, setConfirming] = useState(false);

  const close = () => {
    setConfirming(false);
    onClose();
  };

  return (
    <Dialog visible={visible} onDismiss={close}>
      <DialogContent>
        {confirming ? (
          <>
            <DialogHeader style={styles.header}>
              <DialogTitle>Delete routine?</DialogTitle>
              <DialogDescription>{`${routineName} will be removed from your routines. This can't be undone.`}</DialogDescription>
            </DialogHeader>
            <View style={styles.row}>
              <Button variant="outline" onPress={close} containerStyle={styles.flex} style={styles.button}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onPress={() => {
                  close();
                  onDelete();
                }}
                containerStyle={styles.flex}
                style={styles.button}
              >
                Delete
              </Button>
            </View>
          </>
        ) : (
          <>
            <DialogHeader style={styles.header}>
              <DialogTitle>{routineName}</DialogTitle>
            </DialogHeader>
            <View style={styles.column}>
              <Button
                variant="outline"
                onPress={() => {
                  close();
                  onDuplicate();
                }}
                style={styles.button}
              >
                Duplicate
              </Button>
              {canDelete && (
                <Button variant="outline" onPress={() => setConfirming(true)} style={styles.button}>
                  Delete
                </Button>
              )}
              <Button variant="ghost" onPress={close} style={styles.button}>
                Cancel
              </Button>
            </View>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 0 },
  row: { flexDirection: 'row', gap: 12, marginTop: 24 },
  column: { gap: 8, marginTop: 20 },
  flex: { flex: 1 },
  button: { minHeight: 48 },
});
