import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { formatCompact, type OverallStats } from '../lib/history';
import type { WeightUnit } from '../types';

/**
 * @file HistoryTotals.tsx
 * @description The History screen's totals: workouts, minutes and volume as
 * three big chalk Oswald numbers with a muted word under each. Status, so no
 * accent and no card.
 */

interface HistoryTotalsProps {
  stats: OverallStats;
  weightUnit: WeightUnit;
}

export function HistoryTotals({ stats, weightUnit }: HistoryTotalsProps) {
  const colors = Colors.dark;
  const total = (value: string, label: string) => (
    <View style={styles.total} accessible accessibilityLabel={`${value} ${label}`}>
      <Text style={[styles.value, { color: colors.foreground }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.row}>
      {total(formatCompact(stats.totalWorkouts), stats.totalWorkouts === 1 ? 'workout' : 'workouts')}
      {total(formatCompact(stats.totalDuration / 60), 'minutes')}
      {total(formatCompact(stats.totalVolume), `${weightUnit} lifted`)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  total: { flex: 1, minWidth: 0 },
  value: { fontFamily: Fonts.displayBold, fontSize: 34, lineHeight: 40, fontVariant: ['tabular-nums'] },
  label: { marginTop: 4, fontSize: 13 },
});
