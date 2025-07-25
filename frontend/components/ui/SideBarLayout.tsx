import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { VerticalTabBar } from '@/components/ui/VerticalTabBar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface SidebarLayoutProps {
  children: React.ReactNode;
  sidebarWidth?: number;
}

export function SidebarLayout({ children, sidebarWidth = 280 }: SidebarLayoutProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content]}>
        {/* Vertical Sidebar */}
        <VerticalTabBar 
        />
        
        {/* Main Content */}
        <View style={styles.mainContent}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
  },
});