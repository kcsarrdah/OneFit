import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { Colors, GlassEffectConfig } from '@/constants/Colors';
import { CenteredMessage } from '../components/CenteredMessage';
import { CreateCustomRoutineModal } from '../components/CreateCustomRoutineModal';
import { RoutineCard } from '../components/RoutineCard';
import { ROUTINE_FILTERS } from '../constants';
import { useCustomRoutines } from '../hooks/useCustomRoutines';
import { filterRoutines, type AnyRoutine } from '../lib/routines';
import type { RoutineCategory } from '../types';

/**
 * @file RoutinesScreen.tsx
 * @description Built-in and custom routines, filtered by category chips.
 * Each row starts its routine with the orange button; Duplicate and Delete
 * sit in its ⋯ menu. "+ New" opens the create-routine form.
 */

interface RoutinesScreenProps {
  onStartRoutine: (routine: AnyRoutine) => void;
}

const SIDEBAR_INSET = GlassEffectConfig.dimensions.vertical.contentInset;

const logError = (what: string) => (error: unknown) => console.error(`Failed to ${what}:`, error);

export function RoutinesScreen({ onStartRoutine }: RoutinesScreenProps) {
  const { routines, isLoading, duplicateRoutine, deleteCustomRoutine, createCustomRoutine } = useCustomRoutines();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'All' | RoutineCategory>('All');
  const colors = Colors.dark;
  const insets = useSafeAreaInsets();

  if (isLoading) return <CenteredMessage body="Loading routines..." />;

  const visible = filterRoutines(routines, filter);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingLeft: SIDEBAR_INSET, paddingBottom: insets.bottom + 96 }]}
    >
      <View style={styles.header}>
        <ScreenTitle>Routines</ScreenTitle>
        <Pressable
          onPress={() => setShowCreateModal(true)}
          accessibilityRole="button"
          accessibilityLabel="New routine"
          style={({ pressed }) => [styles.pill, { borderColor: colors.input }, pressed && { backgroundColor: colors.secondary }]}
        >
          <Text style={[styles.pillText, { color: colors.foreground }]}>+ New</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipStrip}
      >
        {ROUTINE_FILTERS.map((option) => {
          const selected = filter === option;
          return (
            <Pressable
              key={option}
              onPress={() => setFilter(option)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[
                styles.pill,
                selected ? { backgroundColor: colors.foreground, borderColor: colors.foreground } : { borderColor: colors.input },
              ]}
            >
              <Text style={[styles.pillText, { color: selected ? colors.background : colors.foreground }]}>{option}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.list}>
        {visible.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>No {filter} routines yet.</Text>
        ) : (
          visible.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onStart={() => onStartRoutine(routine)}
              onDuplicate={() => duplicateRoutine(routine).catch(logError('duplicate routine'))}
              onDelete={() => deleteCustomRoutine(routine.id).catch(logError('delete routine'))}
            />
          ))
        )}
      </View>

      <CreateCustomRoutineModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoutine={createCustomRoutine}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 20, paddingRight: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  // The strip runs to the screen edge; its content keeps the gutter.
  chipStrip: { marginRight: -20 },
  chips: { gap: 8, paddingVertical: 18, paddingRight: 20 },
  pill: { height: 40, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, justifyContent: 'center' },
  pillText: { fontSize: 14, fontWeight: '600' },
  list: { gap: 8 },
  empty: { fontSize: 15, paddingVertical: 24 },
});
