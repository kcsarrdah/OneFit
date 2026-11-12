import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

/**
 * @file StatColumn.tsx
 * @description A bold number over a small label, centred. Used in rows of
 * stats on routine and history cards. `size` sets the number's scale; `lg`
 * columns share the row equally.
 */

type Size = 'sm' | 'md' | 'lg';

interface StatColumnProps {
  value: React.ReactNode;
  label: string;
  valueColor: string;
  labelColor: string;
  size?: Size;
}

export function StatColumn({ value, label, valueColor, labelColor, size = 'md' }: StatColumnProps) {
  return (
    <View style={[styles.item, size === 'lg' && styles.itemLg]}>
      <ThemedText style={[styles.value, VALUE_SIZE[size], { color: valueColor }]}>{value}</ThemedText>
      <ThemedText style={[styles.label, size === 'lg' && styles.labelLg, { color: labelColor }]}>{label}</ThemedText>
    </View>
  );
}

const VALUE_SIZE = StyleSheet.create({
  sm: { fontSize: 14 },
  md: { fontSize: 16 },
  lg: { fontSize: 24 },
});

const styles = StyleSheet.create({
  item: { alignItems: 'center' },
  itemLg: { flex: 1 },
  value: { fontWeight: 'bold' },
  label: { fontSize: 12, marginTop: 2 },
  labelLg: { marginTop: 4 },
});
