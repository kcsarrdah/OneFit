import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { CenteredMessage } from '../components/CenteredMessage';
import { CreateCustomRoutineModal } from '../components/CreateCustomRoutineModal';
import { RoutineCard } from '../components/RoutineCard';
import { ROUTINE_FILTERS } from '../constants';
import { useCustomRoutines } from '../hooks/useCustomRoutines';
import { filterRoutines, type AnyRoutine } from '../lib/routines';
import type { RoutineCategory } from '../types';

/**
 * @file RoutinesScreen.tsx
 * @description Built-in and custom routines, filtered by category. Start one
 * to load its exercises into the workout, duplicate it, or create your own.
 */

interface RoutinesScreenProps {
  onStartRoutine: (routine: AnyRoutine) => void;
}

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
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: colors.foreground }]}>Workout Routines</ThemedText>
        <Button
          onPress={() => setShowCreateModal(true)}
          variant="default"
          size="sm"
          style={[styles.createButton, { backgroundColor: colors.accent }]}
        >
          <ThemedText style={[styles.createText, { color: colors.accentForeground }]}>+ Create</ThemedText>
        </Button>
      </View>

      <View style={styles.filters}>
        <ThemedText style={[styles.filterLabel, { color: colors.mutedForeground }]}>Category</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {ROUTINE_FILTERS.map((option) => {
            const selected = filter === option;
            return (
              <Button
                key={option}
                onPress={() => setFilter(option)}
                variant={selected ? 'default' : 'outline'}
                size="sm"
                style={[styles.filterButton, selected && { backgroundColor: colors.accent }]}
              >
                <ThemedText
                  style={[styles.filterText, { color: selected ? colors.accentForeground : colors.foreground }]}
                >
                  {option}
                </ThemedText>
              </Button>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.list}>
        {visible.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No routines found matching your filters
            </ThemedText>
          </View>
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
  content: { paddingTop: 15, paddingHorizontal: 16, paddingBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold' },
  createButton: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  createText: { fontSize: 14, fontWeight: '600' },
  filters: { marginBottom: 40 },
  filterLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  filterScroll: { flexGrow: 0 },
  filterButton: { marginRight: 8, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 6 },
  filterText: { fontSize: 12, fontWeight: '500' },
  list: { gap: 16 },
  empty: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 16, textAlign: 'center' },
});
