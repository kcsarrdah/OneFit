import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import HydrationTracker from '@/components/HydraionTracker';

export default function WaterTrackingScreen() {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <HydrationTracker userName="User" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});