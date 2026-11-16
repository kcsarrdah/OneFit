import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';

/**
 * @file FastRing.tsx
 * @description The fast's progress ring: a chalk arc on a dark track (status,
 * so not orange), with one big Oswald number in the middle and a short
 * caption under it.
 */

interface FastRingProps {
  /** 0..100 of the goal. */
  progress: number;
  /** The big number, e.g. "7:42". */
  value: string;
  /** The line under it, e.g. "left · 52%". */
  caption: string;
  size?: number;
}

const STROKE = 12;

export function FastRing({ progress, value, caption, size = 248 }: FastRingProps) {
  const colors = Colors.dark;
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const centre = size / 2;
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <View
      style={[styles.ring, { width: size, height: size }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${value} ${caption}`}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={centre} cy={centre} r={radius} stroke={colors.secondary} strokeWidth={STROKE} fill="none" />
        {/* No arc at 0: a round cap would still draw a dot at the top. */}
        {clamped > 0 && (
          <Circle
            cx={centre}
            cy={centre}
            r={radius}
            stroke={colors.foreground}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - clamped / 100)}
            fill="none"
            transform={`rotate(-90 ${centre} ${centre})`}
          />
        )}
      </Svg>
      <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.caption, { color: colors.mutedForeground }]}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { alignItems: 'center', justifyContent: 'center' },
  value: {
    fontFamily: Fonts.displayBold,
    fontSize: 64,
    lineHeight: 72,
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },
  caption: { marginTop: 4, fontSize: 15 },
});
