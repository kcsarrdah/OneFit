import React from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';

/**
 * @file ScreenTitle.tsx
 * @description A screen's title in the display voice: Oswald, uppercase,
 * 40 pt. One per screen, at the top, with nothing above it.
 */

interface ScreenTitleProps {
  children: string;
  style?: StyleProp<TextStyle>;
}

export function ScreenTitle({ children, style }: ScreenTitleProps) {
  return (
    <Text style={[styles.title, style]} accessibilityRole="header">
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: Fonts.display,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: Colors.dark.foreground,
  },
});
