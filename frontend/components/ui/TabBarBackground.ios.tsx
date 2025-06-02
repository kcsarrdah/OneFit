import React from 'react';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function BlurTabBarBackground() {
  const colorScheme = useColorScheme();
  const grayBackground = useThemeColor({}, 'secondary');
  
  return (
    <>
      {/* Light gray tint */}
      <View 
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: grayBackground + '20', // Very light gray tint
            borderRadius: 27.5,
            overflow: 'hidden',
          }
        ]} 
      />
      {/* Blur overlay */}
      <BlurView
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        intensity={15}
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: 27.5,
            overflow: 'hidden',
          }
        ]}
      />
    </>
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}