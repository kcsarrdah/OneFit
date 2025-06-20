import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Haptics from 'expo-haptics';

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
  const backgroundColor = useThemeColor({}, 'secondary');
  const activeTintColor = Colors[colorScheme ?? 'light'].foreground;
  const inactiveTintColor = Colors[colorScheme ?? 'light'].tabIconDefault;

  return (
    <View style={[styles.container, { bottom: insets.bottom + 25 }]}>
      <View style={[styles.background, { backgroundColor: backgroundColor + 'F0' }]} />
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

          // Ensure we have a valid icon name, fallback if needed
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
              <IconSymbol
                name={iconName}
                size={isFocused ? 28 : 24}
                color={isFocused ? activeTintColor : inactiveTintColor}
                style={{
                  textShadowColor: 'rgba(0, 0, 0, 0.5)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused ? activeTintColor : inactiveTintColor,
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
    left: 40,
    right: 40,
    height: Platform.OS === 'android' ? 70 : 55,
    borderRadius: Platform.OS === 'android' ? 35 : 27.5, 
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    zIndex: 1000,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Platform.OS === 'android' ? 35 : 27.5,
    overflow: 'hidden',
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
  label: {
    marginTop: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
  },
});