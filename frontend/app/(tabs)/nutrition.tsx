// frontend/app/(tabs)/nutrition.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function NutritionScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Nutrition</ThemedText>
      <ThemedText>Test tab for scrolling</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
});