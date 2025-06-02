import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function TabBarBackground() {
  const backgroundColor = useThemeColor({}, 'secondary');
  
  return (
    <View 
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: backgroundColor + 'F0', // Much higher opacity (75%) to hide text
          borderRadius: 27.5,
          overflow: 'hidden',
        }
      ]} 
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}