import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { isCustomRoutine, routineSummary, type AnyRoutine } from '../lib/routines';
import { RoutineMenu } from './RoutineMenu';

/**
 * @file RoutineCard.tsx
 * @description One routine on the Routines screen, as a row: name, then
 * "45 min · 5 exercises · Full Body", a ⋯ button for Duplicate / Delete, and
 * the orange start button (the row's one action).
 */

interface RoutineCardProps {
  routine: AnyRoutine;
  onStart: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function RoutineCard({ routine, onStart, onDuplicate, onDelete }: RoutineCardProps) {
  const colors = Colors.dark;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={[styles.row, { backgroundColor: colors.card }]}>
      <View style={styles.text}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>
          {routine.name}
        </Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]} numberOfLines={2}>
          {routineSummary(routine)}
        </Text>
      </View>

      <Pressable
        onPress={() => setMenuOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`More for ${routine.name}`}
        style={({ pressed }) => [styles.icon, pressed && { backgroundColor: colors.secondary }]}
      >
        <IconSymbol name="ellipsis" size={22} color={colors.mutedForeground} />
      </Pressable>
      <Pressable
        onPress={onStart}
        accessibilityRole="button"
        accessibilityLabel={`Start ${routine.name}`}
        style={({ pressed }) => [styles.icon, { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 }]}
      >
        <IconSymbol name="play.fill" size={20} color={colors.accentForeground} />
      </Pressable>

      <RoutineMenu
        visible={menuOpen}
        routineName={routine.name}
        canDelete={isCustomRoutine(routine)}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onClose={() => setMenuOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 18,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 10,
  },
  text: { flex: 1, minWidth: 0 },
  name: { fontSize: 16, fontWeight: '600' },
  sub: { marginTop: 3, fontSize: 13 },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
