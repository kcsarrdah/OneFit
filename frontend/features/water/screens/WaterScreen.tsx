import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { HydrationActions } from '../components/HydrationActions';
import { WaterFill } from '../components/WaterFill';
import { useHydration } from '../hooks/useHydration';
import { fillFraction, remaining } from '../lib/hydration';

/**
 * @file WaterScreen.tsx
 * @description The water tracker: today's intake in big numbers, what is
 * left of the goal, and the screen filling with water as you log.
 */

export function WaterScreen() {
  const colors = Colors.dark;
  const { dailyGoal, intake, logAmount, isLoaded, logWater, resetWater } = useHydration();

  if (!isLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading Hydration Data...</Text>
      </View>
    );
  }

  const fraction = fillFraction(intake, dailyGoal);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.textArea}>
        <Text style={[styles.intake, { color: colors.foreground }]}>
          {intake.toLocaleString()}
          <Text style={styles.intake}>ml</Text>
        </Text>
        <Text style={[styles.remaining, { color: colors.mutedForeground }]}>
          Remaining {remaining(intake, dailyGoal).toLocaleString()}ml of {dailyGoal.toLocaleString()}ml
        </Text>
        <Text style={[styles.progress, { color: colors.foreground }]}>{Math.round(fraction * 100)}% Complete</Text>
      </View>

      <HydrationActions intake={intake} logAmount={logAmount} onLog={logWater} onReset={resetWater} />

      <WaterFill fraction={fraction} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16 },
  textArea: { alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 16, zIndex: 20 },
  intake: { fontSize: 64, fontWeight: 'bold', textAlign: 'center' },
  remaining: { fontSize: 16, textAlign: 'center', marginTop: 8 },
  progress: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginTop: 4 },
});
