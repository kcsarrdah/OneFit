import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { colorScheme, toggleTheme } = useTheme();
  const backgroundColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'foreground');
  
  return (
    <Pressable
      style={[
        styles.button,
        { 
          backgroundColor,
          borderColor,
        }
      ]}
      onPress={toggleTheme}
      android_ripple={{ color: borderColor, borderless: true }}
    >
      <IconSymbol
        name={colorScheme === 'dark' ? 'sun.max' : 'moon'}
        size={20}
        color={iconColor}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
});