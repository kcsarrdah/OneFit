import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from './IconSymbol';
import { GlassmorphismColors, GlassEffectConfig } from '@/constants/Colors';
import { useNavigation, SidebarOption } from '@/contexts/NavigationContext';

/**
 * @file VerticalTabBar.tsx
 * @description The floating liquid-glass sidebar: the current tab's sections
 * (and the global Analytics / Settings). The active item sits on a soft glass
 * pill. Hidden in focus mode. Screens keep clear of it with
 * `GlassEffectConfig.dimensions.vertical.contentInset`.
 */

interface VerticalTabBarProps {
  position?: 'left' | 'right';
  topOffset?: number;
  maxHeight?: number;
}

const glass = GlassmorphismColors.dark;
const { width: BAR_WIDTH, tabHeight: TAB_HEIGHT } = GlassEffectConfig.dimensions.vertical;
const PADDING = 16; // top + bottom

export function VerticalTabBar({ position = 'left', topOffset = 20, maxHeight = 400 }: VerticalTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentSidebarOption, setCurrentSidebarOption, getSidebarOptions, getCurrentConfig, focusMode } =
    useNavigation();

  const config = getCurrentConfig();
  const sidebarOptions = getSidebarOptions();

  // Select the first item when nothing is selected yet.
  React.useEffect(() => {
    if (!currentSidebarOption && sidebarOptions.length > 0) {
      const firstOption = sidebarOptions.find((opt) => opt.id !== 'separator');
      if (firstOption) setCurrentSidebarOption(firstOption.id);
    }
  }, [currentSidebarOption, sidebarOptions, setCurrentSidebarOption]);

  if (!config || focusMode) return null;

  const isGlobal = (option: SidebarOption) => config.globalOptions.some((go) => go.id === option.id);

  const handleOptionPress = (option: SidebarOption) => {
    if (process.env.EXPO_OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentSidebarOption(option.id);
    // Global options (Analytics, Settings) are routes of their own.
    if (isGlobal(option)) router.push(option.route as any);
  };

  const options = sidebarOptions.filter((option) => option.id !== 'separator');
  const contentHeight = options.length * TAB_HEIGHT + PADDING;
  const overflows = contentHeight > maxHeight;

  return (
    <View style={[styles.container, { [position]: 15, top: insets.top + topOffset, height: Math.min(contentHeight, maxHeight) }]}>
      <View style={[styles.glass, { backgroundColor: glass.background }]} />
      <View style={[styles.glass, styles.glassOverlay, { backgroundColor: glass.overlay, borderColor: glass.border }]} />

      <ScrollView showsVerticalScrollIndicator={overflows} bounces={overflows} contentContainerStyle={styles.scrollContent}>
        {options.map((option) => {
          const isActive = currentSidebarOption === option.id;
          const color = isActive ? glass.iconActive : isGlobal(option) ? glass.iconMuted : glass.iconInactive;

          return (
            <TouchableOpacity
              key={option.id}
              accessibilityRole="button"
              accessibilityState={isActive ? { selected: true } : {}}
              accessibilityLabel={option.label}
              onPress={() => handleOptionPress(option)}
              style={styles.tab}
              activeOpacity={0.7}
            >
              {/* The pill is narrower than the tab so labels get the full width. */}
              {isActive && <View style={styles.activePill} />}
              <IconSymbol name={option.icon as any} size={isActive ? 26 : 24} color={color} style={styles.shadow} />
              <Text style={[styles.label, isActive && styles.labelActive, { color }]} numberOfLines={1}>
                {option.label}
              </Text>
              {option.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{option.badge}</Text>
                </View>
              )}
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
    width: BAR_WIDTH,
    borderRadius: GlassEffectConfig.borderRadius.vertical,
    ...GlassEffectConfig.shadow,
    shadowColor: '#000',
    zIndex: 1000,
    overflow: 'hidden',
  },
  glass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: GlassEffectConfig.borderRadius.vertical,
  },
  glassOverlay: { borderWidth: 0.5 },
  scrollContent: { alignItems: 'center', paddingVertical: PADDING / 2 },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    height: TAB_HEIGHT,
    width: BAR_WIDTH,
  },
  activePill: {
    ...StyleSheet.absoluteFillObject,
    left: 4,
    right: 4,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  shadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  label: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '400',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
  },
  labelActive: { fontSize: 10.5, fontWeight: '600' },
  badge: {
    position: 'absolute',
    top: 6,
    right: 4,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    backgroundColor: '#e5484d',
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#fff7f5' },
});
