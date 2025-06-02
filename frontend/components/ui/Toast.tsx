// frontend/components/ui/Toast.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from './IconSymbol';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
}

export function Toast({
  id,
  title,
  description,
  variant = 'default',
  open = true,
  onOpenChange,
  duration = 5000,
}: ToastProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const translateY = React.useRef(new Animated.Value(-100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        onOpenChange?.(false);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: -100,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open, duration, onOpenChange]);

  const backgroundColor = variant === 'destructive' ? colors.destructive : colors.background;
  const textColor = variant === 'destructive' ? colors.destructiveForeground : colors.foreground;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor: colors.border,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        {title && <Text style={[styles.title, { color: textColor }]}>{title}</Text>}
        {description && (
          <Text style={[styles.description, { color: textColor }]}>{description}</Text>
        )}
      </View>
      <TouchableOpacity
  onPress={() => onOpenChange?.(false)}
  style={styles.closeButton}
>
  <IconSymbol 
    name="chevron.right" 
    size={16} 
    color={textColor}
    style={{ transform: [{ rotate: '45deg' }] }}
  />
</TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
  },
});