import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNavigation, SidebarOption } from '@/contexts/NavigationContext';
import * as Haptics from 'expo-haptics';
import { GlassmorphismColors, GlassEffectConfig } from '@/constants/Colors';

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
  
  // Use constants for cleaner code
  const glassColors = GlassmorphismColors[colorScheme ?? 'light'];
  const glassConfig = GlassEffectConfig;
  
  const router = useRouter();
  const { 
    currentSidebarOption, 
    setCurrentSidebarOption, 
    getSidebarOptions,
    getCurrentConfig
  } = useNavigation();

  const config = getCurrentConfig(); 
  const sidebarOptions = getSidebarOptions();

  // Set default to first item if no current selection
  React.useEffect(() => {
    if (!currentSidebarOption && sidebarOptions.length > 0) {
      const firstOption = sidebarOptions.find(opt => opt.id !== 'separator');
      if (firstOption) {
        setCurrentSidebarOption(firstOption.id);
      }
    }
  }, [currentSidebarOption, sidebarOptions, setCurrentSidebarOption]);

  const handleOptionPress = (option: SidebarOption) => {
    if (option.id === 'separator') return;
    
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setCurrentSidebarOption(option.id);
    

    const isGlobalOption = config?.globalOptions.some(go => go.id === option.id);
    
    if (isGlobalOption) {
      // Navigate to global routes like /settings, /analytics
      router.push(option.route as any);
    }

  };

  if (!config) return null;

  // Filter out separators for the vertical tab bar
  const filteredOptions = sidebarOptions.filter(option => option.id !== 'separator');
  
  // Calculate dynamic height based on number of options
  const tabHeight = glassConfig.dimensions.vertical.tabHeight; // Use glassConfig here
  const padding = 16; // Top and bottom padding
  const minContentHeight = filteredOptions.length * tabHeight + padding;
  const dynamicHeight = Math.min(minContentHeight, maxHeight);
  
  return (
    <View style={[
      styles.container, 
      {
        [position]: 15,
        top: insets.top + topOffset,
        height: dynamicHeight,
      }
    ]}>
      {/* Simplified Glass Background - 2 layers instead of 4 */}
      <View style={[styles.glassBackground, { 
        backgroundColor: glassColors.background,
      }]} />
      
      <View style={[styles.glassOverlay, {
        backgroundColor: glassColors.overlay,
        borderColor: glassColors.border,
      }]} />
      
      <ScrollView
        showsVerticalScrollIndicator={filteredOptions.length * glassConfig.dimensions.vertical.tabHeight + padding > maxHeight}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            minHeight: minContentHeight > maxHeight ? maxHeight - padding : minContentHeight - padding 
          }
        ]}
        style={styles.scrollView}
        bounces={filteredOptions.length * glassConfig.dimensions.vertical.tabHeight + padding > maxHeight}
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
              {/* Bullet indicator for active tab */}
              {isActive && (
                <View style={[styles.bulletIndicator, { 
                  backgroundColor: glassColors.background,
                  borderColor: glassColors.border,
                  // Platform-specific positioning - Android uses absolute positioning in styles
                  ...(Platform.OS === 'ios' 
                    ? (position === 'left' ? { right: -8 } : { left: -8 })
                    : {}),
                }]} />
              )}
              
              <IconSymbol
                name={option.icon as any}
                size={isActive ? 28 : 24}
                color={isActive 
                  ? glassColors.iconActive 
                  : (isGlobalOption ? glassColors.iconMuted : glassColors.iconInactive)}
                style={styles.iconShadow}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: isActive 
                      ? glassColors.iconActive 
                      : (isGlobalOption ? glassColors.iconMuted : glassColors.iconInactive),
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
    width: GlassEffectConfig.dimensions.vertical.width,
    borderRadius: GlassEffectConfig.borderRadius.vertical,
    ...GlassEffectConfig.shadow,
    shadowColor: '#000',
    zIndex: 1000,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden', // Changed from 'visible' to 'hidden' to contain the indicator
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: GlassEffectConfig.borderRadius.vertical,
    overflow: 'hidden',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: GlassEffectConfig.borderRadius.vertical,
    overflow: 'hidden',
    borderWidth: 0.5,
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
    minHeight: GlassEffectConfig.dimensions.vertical.tabHeight,
    maxHeight: Platform.OS === 'android' ? 95 : 80,
    width: '100%',
    borderRadius: 8,
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
  bulletIndicator: {
    position: 'absolute',
    borderWidth: 1,
    shadowColor: '#000',
    zIndex: 0,
    ...Platform.select({
      android: {
        width: 48,
        height: 70,
        borderRadius: 25,
        top: '40%',
        right: 5, // Changed from left: '87%' to right: 4 (inside bounds)
        transform: [
          { translateX: 0 }, // Removed translateX since we're positioning from right
          { translateY: -17.5 }
        ],
        marginTop: 0,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      ios: {
        width: 47,
        height: 62,
        borderRadius: 20,
        top: '75%',
        left: '8%', // Changed from left: '8%' to right: 6 (inside bounds)
        transform: [
          { translateX: 0 }, // Removed translateX
          { translateY: -16 }
        ],
        marginTop: -16,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
    }),
  }
});