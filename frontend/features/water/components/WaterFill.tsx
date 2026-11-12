import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { WaterColors } from '@/constants/Colors';

/**
 * @file WaterFill.tsx
 * @description The water rising from the bottom of the screen as the day's
 * intake grows, with a surface line and a shimmer.
 */

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WaterFillProps {
  /** 0 (empty) to 1 (goal reached). */
  fraction: number;
}

export function WaterFill({ fraction }: WaterFillProps) {
  const [shimmerOpacity, setShimmerOpacity] = useState(0.3);
  const [surfaceOffset, setSurfaceOffset] = useState(0);

  useEffect(() => {
    const shimmer = setInterval(() => setShimmerOpacity((prev) => (prev === 0.3 ? 0.7 : 0.3)), 1500);
    const surface = setInterval(() => setSurfaceOffset((prev) => (prev === 0 ? -2 : 0)), 2000);
    return () => {
      clearInterval(shimmer);
      clearInterval(surface);
    };
  }, []);

  return (
    <View style={[styles.water, { height: fraction * SCREEN_HEIGHT, backgroundColor: WaterColors.high }]}>
      <View
        style={[
          styles.surface,
          { backgroundColor: WaterColors.surface + '60', transform: [{ translateY: surfaceOffset }] },
        ]}
      />
      <View style={[styles.shimmer, { backgroundColor: WaterColors.light + '60', opacity: shimmerOpacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  water: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  surface: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  shimmer: { position: 'absolute', top: 8, left: '20%', right: '20%', height: 4, borderRadius: 2 },
});
