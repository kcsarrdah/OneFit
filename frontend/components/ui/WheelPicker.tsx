import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface WheelPickerProps {
  selectedValue: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export const WheelPicker: React.FC<WheelPickerProps> = ({
  selectedValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = '',
  disabled = false,
  style,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<number | undefined>(undefined);
  
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const foregroundColor = useThemeColor({}, 'foreground');
  const mutedColor = useThemeColor({}, 'mutedForeground');
  const accentColor = useThemeColor({}, 'accent');
  const cardColor = useThemeColor({}, 'card');

  // Generate values
  const values = React.useMemo(() => {
    const result = [];
    for (let i = min; i <= max; i += step) {
      result.push(i);
    }
    return result;
  }, [min, max, step]);

  const ITEM_HEIGHT = 40;

  // Find index of selected value
  const selectedIndex = values.indexOf(selectedValue);

  // Scroll to selected item when selectedValue changes
  useEffect(() => {
    if (scrollViewRef.current && selectedIndex !== -1 && !isScrolling) {
      const scrollY = selectedIndex * ITEM_HEIGHT;
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: scrollY,
          animated: true,
        });
      }, 100);
    }
  }, [selectedIndex, isScrolling]);

  const updateSelectedValue = useCallback((scrollY: number) => {
    if (disabled) return;
    
    const index = Math.round(scrollY / ITEM_HEIGHT);
    
    if (index >= 0 && index < values.length) {
      const value = values[index];
      if (value !== selectedValue) {
        onValueChange(value);
      }
    }
  }, [values, selectedValue, onValueChange, disabled]);

  const handlePress = useCallback((value: number) => {
    if (!disabled) {
      onValueChange(value);
    }
  }, [onValueChange, disabled]);

  // Use onScroll for Android, onMomentumScrollEnd for iOS
  const handleScroll = useCallback((event: any) => {
    if (!event || !event.nativeEvent || typeof event.nativeEvent.contentOffset === 'undefined') {
      return;
    }

    const scrollY = event.nativeEvent.contentOffset.y;

    if (Platform.OS === 'android') {
      // Clear previous timeout
      if (scrollTimeoutRef.current !== undefined) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set a new timeout to handle the scroll end
      scrollTimeoutRef.current = setTimeout(() => {
        updateSelectedValue(scrollY);
        setIsScrolling(false);
      }, 150);
    }
  }, [updateSelectedValue]);

  const handleMomentumScrollEnd = useCallback((event: any) => {
    if (!event || !event.nativeEvent || typeof event.nativeEvent.contentOffset === 'undefined') {
      setIsScrolling(false);
      return;
    }

    const scrollY = event.nativeEvent.contentOffset.y;

    if (Platform.OS === 'ios') {
      updateSelectedValue(scrollY);
    }
    setIsScrolling(false);
  }, [updateSelectedValue]);

  const handleScrollBeginDrag = useCallback(() => {
    setIsScrolling(true);
    // Clear any pending timeout on Android
    if (Platform.OS === 'android' && scrollTimeoutRef.current !== undefined) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    // Don't set isScrolling to false here for Android, let the timeout handle it
    if (Platform.OS === 'ios') {
      setIsScrolling(false);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current !== undefined) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: cardColor, borderColor }, style]}>
      {/* Optional: Add center position indicator */}
      <View style={styles.centerIndicator} />
      
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="center" // This helps with centering
        decelerationRate={Platform.OS === 'android' ? 'fast' : 'fast'}
        onScroll={Platform.OS === 'android' ? handleScroll : undefined}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={Platform.OS === 'android' ? 16 : 64}
        contentContainerStyle={styles.contentContainer}
        nestedScrollEnabled={false}
        scrollEnabled={!disabled}
        // Android specific props
        {...(Platform.OS === 'android' && {
          overScrollMode: 'never',
          showsVerticalScrollIndicator: false,
        })}
      >
        {values.map((value, index) => {
          const isSelected = value === selectedValue;
          const distance = Math.abs(index - selectedIndex);
          const opacity = Math.max(0.3, 1 - distance * 0.3);
          
          return (
            <TouchableOpacity
              key={value}
              style={[
                styles.item,
                {
                  height: ITEM_HEIGHT,
                  backgroundColor: isSelected ? accentColor : 'transparent',
                  borderRadius: isSelected ? 8 : 0,
                  opacity,
                },
              ]}
              onPress={() => handlePress(value)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.itemText,
                  {
                    color: isSelected ? 'white' : foregroundColor,
                    fontWeight: isSelected ? 'bold' : 'normal',
                  },
                ]}
              >
                {value}{suffix}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// Update the styles to better center the selected item
const styles = StyleSheet.create({
  container: {
    height: 120,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative', // Add this
  },
  contentContainer: {
    paddingVertical: 40, // This centers the first/last items
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 1,
  },
  itemText: {
    fontSize: 16,
    textAlign: 'center',
  },
  // Add a center indicator (optional visual guide)
  centerIndicator: {
    position: 'absolute',
    top: '50%',
    left: 8,
    right: 8,
    height: 40,
    marginTop: -20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 1,
    pointerEvents: 'none',
  },
}); 