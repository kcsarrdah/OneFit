import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function FastingScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Fasting Tracker</ThemedText>
      <ThemedText>Track your intermittent fasting journey</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});