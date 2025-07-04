import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  ViewStyle 
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ScrollableNumberPickerProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  containerStyle?: ViewStyle;
  disabled?: boolean;
  height?: number;
}

export const ScrollableNumberPicker = React.forwardRef<ScrollView, ScrollableNumberPickerProps>(
  ({ 
    value,
    onValueChange,
    min = 0,
    max = 300,
    step = 1,
    suffix = '',
    containerStyle,
    disabled = false,
    height = 80,
    ...props 
  }, ref) => {
    const scrollViewRef = useRef<ScrollView>(null);
    
    const backgroundColor = useThemeColor({}, 'background');
    const borderColor = useThemeColor({}, 'border');
    const foregroundColor = useThemeColor({}, 'foreground');
    const mutedColor = useThemeColor({}, 'mutedForeground');
    const accentColor = useThemeColor({}, 'accent');
    const cardColor = useThemeColor({}, 'card');

    // Generate array of values
    const values = React.useMemo(() => {
      const result = [];
      for (let i = min; i <= max; i += step) {
        result.push(Math.round(i)); // Use integers only
      }
      return result;
    }, [min, max, step]);

    const itemHeight = 30;
    const centerIndex = Math.floor(height / itemHeight / 2);

    // Find current index based on value
    const currentIndex = values.findIndex(v => v === value);
    const validIndex = currentIndex !== -1 ? currentIndex : 0;

    // Scroll to center the selected value (only when value changes externally)
    useEffect(() => {
      if (scrollViewRef.current && !disabled) {
        const scrollPosition = Math.max(0, validIndex * itemHeight);
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: scrollPosition, animated: true });
        }, 100);
      }
    }, [value, validIndex, disabled]);

    const handleScroll = useCallback((event: any) => {
      if (disabled) return;
      
      const scrollY = event.nativeEvent.contentOffset.y;
      const index = Math.round(scrollY / itemHeight);
      
      if (index >= 0 && index < values.length) {
        const newValue = values[index];
        if (newValue !== value) {
          onValueChange(newValue);
        }
      }
    }, [values, value, onValueChange, disabled]);

    // Render individual number item
    const renderItem = useCallback((itemValue: number, index: number) => {
      const isSelected = itemValue === value;

      return (
        <TouchableOpacity
          key={index}
          style={[
            styles.item,
            {
              height: itemHeight,
              backgroundColor: isSelected ? accentColor : 'transparent',
              borderRadius: isSelected ? 6 : 0,
            },
          ]}
          onPress={() => {
            if (!disabled) {
              onValueChange(itemValue);
            }
          }}
          disabled={disabled}
        >
          <Text style={[
            styles.itemText,
            {
              color: isSelected ? 'white' : foregroundColor,
              fontWeight: isSelected ? 'bold' : 'normal',
            },
          ]}>
            {itemValue}{suffix}
          </Text>
        </TouchableOpacity>
      );
    }, [value, onValueChange, disabled, suffix, accentColor, foregroundColor]);

    return (
      <View style={[styles.container, { height, backgroundColor: cardColor, borderColor }, containerStyle]}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          snapToInterval={itemHeight}
          decelerationRate="fast"
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingVertical: height / 2 - itemHeight / 2 },
          ]}
          {...props}
        >
          {values.map((itemValue, index) => renderItem(itemValue, index))}
        </ScrollView>
      </View>
    );
  }
);

ScrollableNumberPicker.displayName = 'ScrollableNumberPicker';

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: 1,
  },
  itemText: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 