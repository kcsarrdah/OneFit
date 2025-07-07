import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Haptics from 'expo-haptics';
import { GlassmorphismColors, GlassEffectConfig } from '@/constants/Colors';

const iconMap = {
  index: 'house.fill',
  fasting: 'bolt.fill', 
  water: 'drop.fill',
  explore: 'paperplane.fill',
  habits: 'heart.fill',
  nutrition: 'fork.knife',
  workouts: 'figure.run',
} as const;

export function ScrollableTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  
  // Use constants for cleaner code
  const glassColors = GlassmorphismColors[colorScheme ?? 'light'];
  const config = GlassEffectConfig;

  return (
    <View style={[styles.container, { bottom: insets.bottom + 10 }]}>
      {/* Simplified Glass Background - 2 layers instead of 4 */}
      <View style={[styles.glassBackground, { 
        backgroundColor: glassColors.background,
      }]} />
      
      <View style={[styles.glassOverlay, {
        backgroundColor: glassColors.overlay,
        borderColor: glassColors.border,
      }]} />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined 
            ? options.tabBarLabel 
            : options.title !== undefined 
            ? options.title 
            : route.name;

          const isFocused = state.index === index;
          const iconName = iconMap[route.name as keyof typeof iconMap];

          const onPress = () => {
            if (process.env.EXPO_OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
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
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              {/* Bullet indicator for active tab */}
              {isFocused && (
                <View style={[styles.bulletIndicator, { 
                  backgroundColor: glassColors.background,
                  borderColor: glassColors.border,
                }]} />
              )}
              
              <IconSymbol
                name={iconName}
                size={isFocused ? 28 : 24}
                color={isFocused ? glassColors.iconActive : glassColors.iconInactive}
                style={styles.iconShadow}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused ? glassColors.iconActive : glassColors.iconInactive,
                    fontSize: Platform.OS === 'android' 
                      ? (isFocused ? 12 : 11)
                      : (isFocused ? 11 : 10),
                    fontWeight: isFocused ? '600' : '400',
                  },
                ]}
              >
                {String(label || route.name)}
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
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden', // Changed back to hidden to contain the indicator
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: GlassEffectConfig.borderRadius.horizontal,
    overflow: 'hidden',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: GlassEffectConfig.borderRadius.horizontal,
    overflow: 'hidden',
    borderWidth: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
    minWidth: '100%',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'android' ? 8 : 5, 
    paddingHorizontal: 12,
    minWidth: Platform.OS === 'android' ? 80 : 70, 
    maxWidth: Platform.OS === 'android' ? 95 : 80, 
  },
  iconShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  label: {
    marginTop: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
  },
  bulletIndicator: {
    position: 'absolute',
    borderWidth: 1,
    shadowColor: '#000',
    zIndex: 0,
    ...Platform.select({
      android: {
        width: 70,
        height: 53,
        borderRadius: 25,
        bottom: 7.8, 
        left: '68%',
        transform: [
          { translateX: -35 },
          { translateY: 0 }
        ],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      ios: {
        width: 60,
        height: 47,
        borderRadius: 20,
        bottom: 4,
        left: '73%',
        transform: [
          { translateX: -30 },
          { translateY: 0 } 
        ],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
    }),
  }
});
