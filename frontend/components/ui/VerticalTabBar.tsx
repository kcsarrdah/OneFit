import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useNavigation, SidebarOption } from '@/contexts/NavigationContext';
import * as Haptics from 'expo-haptics';

interface VerticalTabBarProps {
  position?: 'left' | 'right';
  topOffset?: number;
  maxHeight?: number;
}

export function VerticalTabBar({ 
  position = 'left', 
  topOffset = 20,
  maxHeight = 400
}: VerticalTabBarProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'secondary');
  const activeTintColor = Colors[colorScheme ?? 'light'].foreground;
  const inactiveTintColor = Colors[colorScheme ?? 'light'].tabIconDefault;
  const mutedColor = Colors[colorScheme ?? 'light'].mutedForeground;

  const darkerInactiveColor = colorScheme === 'dark' ? '#B0B0B0' : '#404040'; // Dark gray
  const darkerMutedColor = colorScheme === 'dark' ? '#888888' : '#606060';   // Medium dark gray
  const darkerActiveColor = colorScheme === 'dark' ? '#FFFFFF' : '#1A1A1A';  // High contrast
  
  const router = useRouter();
  const { 
    currentSidebarOption, 
    setCurrentSidebarOption, 
    getSidebarOptions,
    getCurrentConfig
  } = useNavigation();

  const config = getCurrentConfig();
  const sidebarOptions = getSidebarOptions();

  const handleOptionPress = (option: SidebarOption) => {
    if (option.id === 'separator') return;
    
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setCurrentSidebarOption(option.id);
    router.push(option.route as any);
  };

  if (!config) return null;

  // Filter out separators for the vertical tab bar
  const filteredOptions = sidebarOptions.filter(option => option.id !== 'separator');
  
  // Calculate dynamic height based on number of options
  const tabHeight = Platform.OS === 'android' ? 80 : 70;
  const padding = 16; // Top and bottom padding
  const minContentHeight = filteredOptions.length * tabHeight + padding;
  const dynamicHeight = Math.min(minContentHeight, maxHeight);
  
  return (
    <View style={[
      styles.container, 
      {
        [position]: 25,
        top: insets.top + topOffset,
        height: dynamicHeight,
      }
    ]}>
      <View style={[styles.background, { backgroundColor: backgroundColor + 'CC' }]} />
      <ScrollView
        showsVerticalScrollIndicator={filteredOptions.length * tabHeight + padding > maxHeight}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            minHeight: minContentHeight > maxHeight ? maxHeight - padding : minContentHeight - padding 
          }
        ]}
        style={styles.scrollView}
        bounces={filteredOptions.length * tabHeight + padding > maxHeight}
      >
        {filteredOptions.map((option, index) => {
          const isActive = currentSidebarOption === option.id;
          const isGlobalOption = config.globalOptions.some(go => go.id === option.id);

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
              <IconSymbol
                name={option.icon as any}
                size={isActive ? 28 : 24}
                color={isActive 
                  ? darkerActiveColor 
                  : (isGlobalOption ? darkerMutedColor : darkerInactiveColor)}
                style={{
                  textShadowColor: 'rgba(0, 0, 0, 0.8)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: isActive 
                    ? darkerActiveColor 
                    : (isGlobalOption ? darkerMutedColor : darkerInactiveColor),
                    fontSize: Platform.OS === 'android' 
                      ? (isActive ? 12 : 11)
                      : (isActive ? 11 : 10),
                    fontWeight: isActive ? '600' : '400',
                  },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {option.label}
              </Text>
              {option.badge && (
                <View style={[styles.badge, { backgroundColor: Colors[colorScheme ?? 'light'].destructive }]}>
                  <Text style={[styles.badgeText, { color: Colors[colorScheme ?? 'light'].destructiveForeground }]}>
                    {option.badge}
                  </Text>
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
    width: Platform.OS === 'android' ? 70 : 55,
    borderRadius: Platform.OS === 'android' ? 35 : 27.5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 1000,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Platform.OS === 'android' ? 35 : 27.5,
    overflow: 'hidden',
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Platform.OS === 'android' ? 35 : 27.5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 8,
    justifyContent: 'flex-start',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: Platform.OS === 'android' ? 8 : 5,
    minHeight: Platform.OS === 'android' ? 80 : 70,
    maxHeight: Platform.OS === 'android' ? 95 : 80,
    width: '100%',
    borderRadius: 8,
  },
  label: {
    marginTop: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
    maxWidth: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});