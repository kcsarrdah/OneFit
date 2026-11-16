import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionButton } from '@/components/ui/ActionButton';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { Colors, GlassEffectConfig } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useNavigation } from '@/contexts/NavigationContext';
import { CenteredMessage } from '../components/CenteredMessage';
import { HistoryTotals } from '../components/HistoryTotals';
import { WorkoutHistoryCard } from '../components/WorkoutHistoryCard';
import { useWeightUnit } from '../hooks/useWeightUnit';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';

/**
 * @file HistoryScreen.tsx
 * @description Overall totals (workouts, minutes, volume) and every saved
 * workout, newest first. With nothing saved yet it says what will show up
 * here and offers Start a workout.
 */

const SIDEBAR_INSET = GlassEffectConfig.dimensions.vertical.contentInset;

export function HistoryScreen() {
  const { workoutHistory, isLoading, overallStats, deleteWorkout } = useWorkoutHistory();
  const { weightUnit } = useWeightUnit();
  const { setCurrentSidebarOption } = useNavigation();
  const colors = Colors.dark;
  const insets = useSafeAreaInsets();

  if (isLoading) return <CenteredMessage body="Loading workout history..." />;

  if (workoutHistory.length === 0) {
    return (
      <View style={[styles.empty, { paddingLeft: SIDEBAR_INSET }]}>
        <ScreenTitle>History</ScreenTitle>
        <View style={styles.emptyBody}>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No workouts yet</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Finish a workout and it shows up here, with its sets and volume.
          </Text>
        </View>
        <ActionButton
          label="Start a workout"
          onPress={() => setCurrentSidebarOption('workout')}
          style={[styles.action, { left: SIDEBAR_INSET, bottom: insets.bottom + 84 }]}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingLeft: SIDEBAR_INSET, paddingBottom: insets.bottom + 96 }]}
    >
      <ScreenTitle>History</ScreenTitle>
      <View style={styles.totals}>
        <HistoryTotals stats={overallStats} weightUnit={weightUnit} />
      </View>
      <View style={styles.list}>
        {workoutHistory.map((workout) => (
          <WorkoutHistoryCard key={workout.id} workout={workout} onDelete={() => deleteWorkout(workout.id)} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 20, paddingRight: 20 },
  totals: { marginTop: 22, marginBottom: 26 },
  list: { gap: 8 },
  empty: { flex: 1, paddingTop: 20, paddingRight: 20 },
  emptyBody: { flex: 1, justifyContent: 'center', paddingBottom: 160 },
  emptyTitle: { fontFamily: Fonts.display, fontSize: 26, letterSpacing: 0.6, textTransform: 'uppercase' },
  emptyText: { marginTop: 8, fontSize: 15, lineHeight: 21 },
  action: { position: 'absolute', right: 20 },
});
