import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Input } from '@/components/ui/Input';
import { Colors, GlassEffectConfig } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { MUSCLE_GROUPS } from '../constants';
import type { Exercise } from '../types';
import { formatSets, relativeDay, type NextOption } from '../lib/setLogging';

/**
 * @file PickNext.tsx
 * @description "What's next?": the exercises you've done for a muscle group,
 * most recent first, each with its own last numbers. Picking one opens the set
 * logger. There is no plan to edit: a different exercise is just a different tap.
 */

// The floating sidebar sits over the left edge until navigation is reworked.
const SIDEBAR_INSET = GlassEffectConfig.dimensions.vertical.contentInset;

interface PickNextProps {
  options: NextOption[];
  muscleGroup: string | null;
  onMuscleGroup: (group: string | null) => void;
  query: string;
  onQuery: (query: string) => void;
  onPick: (exercise: Exercise) => void;
  setsLogged: number;
  onFinish: () => void;
}

export function PickNext({ options, muscleGroup, onMuscleGroup, query, onQuery, onPick, setsLogged, onFinish }: PickNextProps) {
  const colors = Colors.dark;
  const insets = useSafeAreaInsets();
  const searching = query.trim().length > 0;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingLeft: SIDEBAR_INSET, paddingBottom: insets.bottom + 160 }]} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.foreground }]} accessibilityRole="header">
          What&apos;s next?
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {[null, ...MUSCLE_GROUPS].map((group) => {
            const active = !searching && group === muscleGroup;
            return (
              <Pressable
                key={group ?? 'all'}
                onPress={() => {
                  onQuery('');
                  onMuscleGroup(group);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[
                  styles.chip,
                  active
                    ? { backgroundColor: colors.foreground }
                    : { borderColor: colors.input, borderWidth: 1 },
                ]}
              >
                <Text style={[styles.chipText, { color: active ? colors.background : colors.foreground }]}>{group ?? 'All'}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.list}>
          {options.map(({ exercise, last, setsToday }) => (
            <Pressable
              key={exercise.id}
              onPress={() => onPick(exercise)}
              accessibilityRole="button"
              accessibilityLabel={`${exercise.name}${last ? `, last ${formatSets(last.sets.slice(0, 1))}` : ''}`}
              style={({ pressed }) => [styles.row, { backgroundColor: pressed ? colors.secondary : colors.card }]}
            >
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: colors.foreground }]}>{exercise.name}</Text>
                <Text style={[styles.rowSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {last ? `Last: ${formatSets(last.sets.slice(0, 1))} · ${relativeDay(last.date)}` : `New · ${exercise.equipment ?? exercise.muscleGroup}`}
                </Text>
              </View>
              {setsToday > 0 ? (
                <Text style={[styles.today, { color: colors.accent }]}>
                  {setsToday} {setsToday === 1 ? 'SET' : 'SETS'} TODAY
                </Text>
              ) : (
                <IconSymbol name="chevron.right" size={20} color={colors.mutedForeground} />
              )}
            </Pressable>
          ))}
          {options.length === 0 && (
            <Text style={[styles.empty, { color: colors.mutedForeground }]}>No exercise matches “{query.trim()}”.</Text>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingLeft: SIDEBAR_INSET, paddingBottom: insets.bottom + 96, backgroundColor: colors.background }]}>
        <Input
          value={query}
          onChangeText={onQuery}
          placeholder="Something else? Search"
          accessibilityLabel="Search exercises"
          returnKeyType="search"
          inputStyle={{ ...styles.search, backgroundColor: colors.card, borderColor: colors.border }}
        />
        {setsLogged > 0 && (
          <View style={styles.session}>
            <Text style={[styles.sessionText, { color: colors.mutedForeground }]}>
              {setsLogged} {setsLogged === 1 ? 'set' : 'sets'} this workout
            </Text>
            <Button
              variant="ghost"
              onPress={onFinish}
              style={styles.finish}
              textStyle={[styles.finishText, { color: colors.accent }]}
            >
              Finish
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  title: {
    fontFamily: Fonts.display,
    fontSize: 40,
    lineHeight: 46,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chips: { gap: 8, paddingVertical: 18 },
  chip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  list: { gap: 8 },
  row: {
    minHeight: 68,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowSub: { marginTop: 3, fontSize: 13 },
  today: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  empty: { fontSize: 14, paddingVertical: 20, textAlign: 'center' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 4,
  },
  session: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 8,
  },
  sessionText: { fontSize: 14, fontWeight: '500' },
  finish: { height: 44, paddingHorizontal: 12 },
  finishText: { fontFamily: Fonts.display, fontSize: 17, letterSpacing: 1, textTransform: 'uppercase' },
  search: {
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 20,
    fontSize: 15,
  },
});
