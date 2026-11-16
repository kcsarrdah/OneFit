import React, { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { WaterColors } from '@/constants/Colors';

/**
 * @file WaterFill.tsx
 * @description The water rising from the bottom of the screen as the day's
 * intake grows, with a gently bobbing surface line and a breathing shimmer.
 *
 * Everything runs on the UI thread with Reanimated. The level is a transform
 * (translateY of a full-height body), never a height, so a change never
 * triggers layout. A new level springs from wherever the water is now, so taps
 * in quick succession and resets glide instead of jumping. The first level
 * after mount is applied without animation (no fill-up on every visit).
 * With Reduce Motion on, the level is set directly and the surface and
 * shimmer hold still.
 */

interface WaterFillProps {
  /** 0 (empty) to 1 (goal reached). */
  fraction: number;
}

/** Slightly underdamped: the water settles with a small, soft slosh. */
const LEVEL_SPRING = { damping: 16, stiffness: 110, mass: 1 } as const;
/** The body extends this far below the screen so an overshoot never shows a gap. */
const OVERFILL = 48;
const SURFACE_BOB = 2; // px the surface line rises and falls
const SURFACE_HALF_PERIOD = 2000; // ms
const SHIMMER_HALF_PERIOD = 1500; // ms
const SHIMMER_MIN = 0.3;
const SHIMMER_MAX = 0.7;
const sine = Easing.inOut(Easing.sin);

export function WaterFill({ fraction }: WaterFillProps) {
  const reduceMotion = useReducedMotion();
  const [height, setHeight] = useState(0);
  const frameHeight = useSharedValue(0);
  const level = useSharedValue(fraction);
  const surface = useSharedValue(0);
  const shimmer = useSharedValue(0.5);

  useEffect(() => {
    level.value = reduceMotion ? fraction : withSpring(fraction, LEVEL_SPRING);
  }, [fraction, reduceMotion, level]);

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(surface);
      cancelAnimation(shimmer);
      surface.value = 0;
      shimmer.value = 0.5;
      return;
    }
    surface.value = 0;
    shimmer.value = 0;
    surface.value = withRepeat(withTiming(1, { duration: SURFACE_HALF_PERIOD, easing: sine }), -1, true);
    shimmer.value = withRepeat(withTiming(1, { duration: SHIMMER_HALF_PERIOD, easing: sine }), -1, true);
    return () => {
      cancelAnimation(surface);
      cancelAnimation(shimmer);
    };
  }, [reduceMotion, surface, shimmer]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: frameHeight.value * (1 - level.value) }],
  }));
  const surfaceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -SURFACE_BOB * surface.value }],
  }));
  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: SHIMMER_MIN + (SHIMMER_MAX - SHIMMER_MIN) * shimmer.value,
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    frameHeight.value = e.nativeEvent.layout.height;
    setHeight(e.nativeEvent.layout.height);
  };

  return (
    <View style={styles.frame} onLayout={onLayout}>
      {height > 0 && (
        <Animated.View style={[styles.body, { height: height + OVERFILL }, bodyStyle]}>
          <Animated.View style={[styles.surface, surfaceStyle]} />
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { ...StyleSheet.absoluteFillObject, zIndex: 10, overflow: 'hidden', pointerEvents: 'none' },
  body: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: WaterColors.high,
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
    backgroundColor: WaterColors.surface + '60',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  shimmer: {
    position: 'absolute',
    top: 8,
    left: '20%',
    right: '20%',
    height: 4,
    borderRadius: 2,
    backgroundColor: WaterColors.light + '60',
  },
});
