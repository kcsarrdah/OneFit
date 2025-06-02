// frontend/app/(tabs)/habits.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HabitsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Habits</ThemedText>
      <ThemedText>Test tab for scrolling</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
});