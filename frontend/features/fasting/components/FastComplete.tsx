import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionButton } from '@/components/ui/ActionButton';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { formatFastLength } from '../lib/format';
import type { CompletedFastData } from '../types';

/**
 * @file FastComplete.tsx
 * @description The end of a fast, as a full-screen accent takeover (the same
 * flood as a logged set): how long it lasted in big Oswald, whether the goal
 * was hit, an optional note, then Save fast or Discard. The screen puts the
 * app in focus mode while this shows, so the chrome steps aside.
 */

interface FastCompleteProps {
  fast: CompletedFastData;
  notes: string;
  onNotes: (notes: string) => void;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function FastComplete({ fast, notes, onNotes, saving, onSave, onDiscard }: FastCompleteProps) {
  const colors = Colors.dark;
  const insets = useSafeAreaInsets();
  const ink = colors.accentForeground;
  const short = fast.goalDurationSeconds - fast.actualDurationSeconds;
  const outcome = short <= 0
    ? `Goal hit · ${formatFastLength(fast.goalDurationSeconds)}`
    : `Ended ${formatFastLength(short)} early`;

  return (
    <View style={[styles.screen, { backgroundColor: colors.accent, paddingTop: insets.top + 96, paddingBottom: insets.bottom + 24 }]}>
      <View>
        <Text style={[styles.title, { color: ink }]} accessibilityRole="header">
          Fast done
        </Text>
        <Text style={[styles.length, { color: ink }]} adjustsFontSizeToFit numberOfLines={1}>
          {formatFastLength(fast.actualDurationSeconds)}
        </Text>
        <Text style={[styles.outcome, { color: ink }]}>{outcome}</Text>
        <TextInput
          value={notes}
          onChangeText={onNotes}
          placeholder="Add a note"
          placeholderTextColor="rgba(11, 9, 8, 0.7)"
          accessibilityLabel="Note"
          style={[styles.note, { color: ink, borderBottomColor: ink }]}
          returnKeyType="done"
        />
      </View>

      <View style={styles.actions}>
        <ActionButton label={saving ? 'Saving…' : 'Save fast'} onPress={onSave} inverted disabled={saving} />
        <Pressable onPress={onDiscard} disabled={saving} accessibilityRole="button" style={styles.discard}>
          <Text style={[styles.discardText, { color: ink }]}>Discard</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { ...StyleSheet.absoluteFillObject, paddingHorizontal: 24, justifyContent: 'space-between', zIndex: 2000 },
  title: { fontFamily: Fonts.displayBold, fontSize: 44, lineHeight: 48, letterSpacing: 0.8, textTransform: 'uppercase' },
  length: {
    marginTop: 28,
    fontFamily: Fonts.displayBold,
    fontSize: 104,
    lineHeight: 112,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  outcome: { marginTop: 8, fontSize: 18, fontWeight: '600' },
  note: { marginTop: 48, height: 48, borderBottomWidth: 2, fontSize: 18, fontWeight: '500' },
  actions: { gap: 4 },
  discard: { height: 48, alignItems: 'center', justifyContent: 'center' },
  discardText: { fontSize: 16, fontWeight: '600' },
});
