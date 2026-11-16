import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Platform, type LayoutChangeEvent } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from './IconSymbol';
import { useNavigation } from '@/contexts/NavigationContext';
import { GlassmorphismColors, GlassEffectConfig } from '@/constants/Colors';
import { centeredScrollX } from '@/lib/tabBarScroll';

/**
 * @file ScrollableTabBar.tsx
 * @description The floating liquid-glass bottom tab bar. It scrolls
 * sideways when the tabs don't fit, and keeps the active tab in view: when
 * the tab changes it glides to centre it. The active tab sits on a soft
 * glass pill. Hidden in focus mode.
 */

const iconMap = {
  index: 'house.fill',
  fasting: 'bolt.fill',
  water: 'drop.fill',
  explore: 'paperplane.fill',
  habits: 'heart.fill',
  nutrition: 'fork.knife',
  workouts: 'figure.run',
} as const;

const glass = GlassmorphismColors.dark;

type Frame = { x: number; width: number };

export function ScrollableTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { focusMode } = useNavigation();
  const scrollRef = useRef<ScrollView>(null);
  const frames = useRef<Record<number, Frame>>({});
  const [viewport, setViewport] = useState({ width: 0, content: 0 });
  const [laidOut, setLaidOut] = useState(0);

  const scrollToActive = useCallback(
    (animated: boolean) => {
      const frame = frames.current[state.index];
      if (!frame || viewport.width === 0) return;
      scrollRef.current?.scrollTo({ x: centeredScrollX(frame, viewport.width, viewport.content), animated });
    },
    [state.index, viewport],
  );

  // Glide to the new tab when it changes; jump there on first layout.
  useEffect(() => scrollToActive(laidOut > 0), [scrollToActive, laidOut]);

  if (focusMode) return null;

  const onTabLayout = (index: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    frames.current[index] = { x, width };
    if (index === state.index) setLaidOut((n) => n + 1);
  };

  return (
    <View
      style={[styles.container, { bottom: insets.bottom + 10 }]}
      onLayout={(e) => setViewport((v) => ({ ...v, width: e.nativeEvent.layout.width }))}
    >
      <View style={[styles.glass, { backgroundColor: glass.background }]} />
      <View style={[styles.glass, styles.glassOverlay, { backgroundColor: glass.overlay, borderColor: glass.border }]} />

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={(content) => setViewport((v) => ({ ...v, content }))}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;
          const iconName = iconMap[route.name as keyof typeof iconMap];
          const color = isFocused ? glass.iconActive : glass.iconInactive;

          const onPress = () => {
            if (process.env.EXPO_OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };

          if (!iconName) {
            console.warn(`No icon found for route: ${route.name}`);
            return null;
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? String(label)}
              onPress={onPress}
              onLayout={onTabLayout(index)}
              style={[styles.tab, isFocused && styles.tabActive]}
              activeOpacity={0.7}
            >
              <IconSymbol name={iconName} size={isFocused ? 26 : 24} color={color} style={styles.shadow} />
              <Text style={[styles.label, isFocused && styles.labelActive, { color }]} numberOfLines={1}>
                {String(label)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: GlassEffectConfig.dimensions.horizontal.margin,
    right: GlassEffectConfig.dimensions.horizontal.margin,
    height: GlassEffectConfig.dimensions.horizontal.height,
    borderRadius: GlassEffectConfig.borderRadius.horizontal,
    ...GlassEffectConfig.shadow,
    shadowColor: '#000',
    zIndex: 1000,
    overflow: 'hidden',
  },
  glass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: GlassEffectConfig.borderRadius.horizontal,
  },
  glassOverlay: { borderWidth: 0.5 },
  scrollContent: { alignItems: 'center', paddingHorizontal: 4, minWidth: '100%' },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    height: GlassEffectConfig.dimensions.horizontal.height - 8,
    paddingHorizontal: 12,
    minWidth: Platform.OS === 'android' ? 80 : 70,
    borderRadius: 22,
  },
  tabActive: { backgroundColor: 'rgba(255, 255, 255, 0.10)' },
  shadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  label: {
    marginTop: 2,
    fontSize: Platform.OS === 'android' ? 11 : 10,
    fontWeight: '400',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
  },
  labelActive: { fontSize: Platform.OS === 'android' ? 12 : 11, fontWeight: '600' },
});
