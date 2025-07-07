import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
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
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [centerValue, setCenterValue] = useState(selectedValue);
  const lastValueRef = useRef(selectedValue);
  
  // Timeout refs for magnetic snap
  const snapTimeoutRef = useRef<number | null>(null);
  const centerStartTimeRef = useRef<number>(0);
  
  // Theme colors
  const foregroundColor = useThemeColor({}, 'foreground');
  const mutedColor = useThemeColor({}, 'mutedForeground');
  const accentColor = useThemeColor({}, 'accent');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  const ITEM_HEIGHT = 24;
  const CONTAINER_HEIGHT = 3 * ITEM_HEIGHT;
  const CENTER_OFFSET = ITEM_HEIGHT;
  const SNAP_TIMEOUT = 300;

  // Generate values (memoized)
  const values = useMemo(() => {
    const result = [];
    for (let i = min; i <= max; i += step) {
      result.push(i);
    }
    return result;
  }, [min, max, step]);

  // Clear any pending snap timeout
  const clearSnapTimeout = useCallback(() => {
    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = null;
    }
  }, []);

  // Force snap to center and select the value
  const snapToCenter = useCallback((scrollY: number, valueToSelect: number) => {
    const index = values.indexOf(valueToSelect);
    if (index !== -1 && scrollViewRef.current) {
      const exactScrollY = index * ITEM_HEIGHT;
      
      // Only snap if not already in exact position
      if (Math.abs(scrollY - exactScrollY) > 1) {
        scrollViewRef.current.scrollTo({
          y: exactScrollY,
          animated: true,
        });
      }
      
      // Update selection
      if (valueToSelect !== lastValueRef.current) {
        lastValueRef.current = valueToSelect;
        onValueChange(valueToSelect);
      }
    }
  }, [values, onValueChange]);

  // Track center item during scroll + set up magnetic snap timeout
  const handleScroll = useCallback((event: any) => {
    if (disabled) return;
    
    const scrollY = event.nativeEvent.contentOffset.y;
    const centerIndex = Math.round(scrollY / ITEM_HEIGHT);
    
    if (centerIndex >= 0 && centerIndex < values.length) {
      const newCenterValue = values[centerIndex];
      
      if (newCenterValue !== centerValue) {
        // Center value changed - clear old timeout and start new one
        clearSnapTimeout();
        setCenterValue(newCenterValue);
        centerStartTimeRef.current = Date.now();
        
        // Set timeout for magnetic snap
        snapTimeoutRef.current = setTimeout(() => {
          // Double-check the value is still in center after timeout
          const currentScrollY = scrollY; // This might not be current, but we'll use momentum end as backup
          snapToCenter(currentScrollY, newCenterValue);
        }, SNAP_TIMEOUT);
      }
    }
  }, [values, centerValue, disabled, clearSnapTimeout, snapToCenter]);

  // Handle tap to select value
  const handlePress = useCallback((value: number) => {
    if (!disabled) {
      clearSnapTimeout(); // Clear any pending snaps
      onValueChange(value);
    }
  }, [onValueChange, disabled, clearSnapTimeout]);

  // Force snap when momentum ends (immediate)
  const handleMomentumScrollEnd = useCallback((event: any) => {
    if (disabled) return;
    
    clearSnapTimeout(); // Clear timeout since we're handling it now
    
    const scrollY = event.nativeEvent.contentOffset.y;
    const centerIndex = Math.round(scrollY / ITEM_HEIGHT);
    
    if (centerIndex >= 0 && centerIndex < values.length) {
      const centerValue = values[centerIndex];
      snapToCenter(scrollY, centerValue);
      setCenterValue(centerValue);
    }
    
    setIsUserScrolling(false);
  }, [values, disabled, clearSnapTimeout, snapToCenter]);

  const handleScrollBeginDrag = useCallback(() => {
    setIsUserScrolling(true);
    clearSnapTimeout(); // Clear any pending snaps when user starts scrolling
  }, [clearSnapTimeout]);

  // ONLY scroll when parent changes selectedValue AND user is not scrolling
  useEffect(() => {
    if (!isUserScrolling && scrollViewRef.current && selectedValue !== lastValueRef.current) {
      const index = values.indexOf(selectedValue);
      if (index !== -1) {
        clearSnapTimeout(); // Clear any pending snaps
        const scrollY = index * ITEM_HEIGHT;
        lastValueRef.current = selectedValue;
        setCenterValue(selectedValue);
        scrollViewRef.current.scrollTo({
          y: scrollY,
          animated: false,
        });
      }
    }
  }, [selectedValue, values, isUserScrolling, clearSnapTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      clearSnapTimeout();
    };
  }, [clearSnapTimeout]);

  return (
    <View style={[styles.container, { backgroundColor: cardColor, borderColor, height: CONTAINER_HEIGHT }, style]}>
      <View 
        style={[
          styles.centerHighlight, 
          { 
            borderColor: accentColor,
            top: CENTER_OFFSET,
            height: ITEM_HEIGHT
          }
        ]} 
      />
      
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={50}
        contentContainerStyle={[
          styles.contentContainer, 
          { 
            paddingTop: CENTER_OFFSET,
            paddingBottom: CENTER_OFFSET
          }
        ]}
        scrollEnabled={!disabled}
      >
        {values.map((value) => {
          const isSelected = value === selectedValue;
          const isCentered = value === centerValue;
          
          return (
            <TouchableOpacity
              key={value}
              style={[
                styles.item,
                {
                  height: ITEM_HEIGHT,
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
                    color: isSelected ? foregroundColor : isCentered ? foregroundColor : mutedColor,
                    fontWeight: isSelected ? 'bold' : isCentered ? '600' : 'normal',
                    fontSize: isCentered ? 18 : 16,
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

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    minWidth: 100,
    width: '100%',
  },
  contentContainer: {
    alignItems: 'center',
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  itemText: {
    textAlign: 'center',
    minWidth: 60,
  },
  centerHighlight: {
    position: 'absolute',
    left: 4,
    right: 4,
    borderRadius: 8,
    borderWidth: 2,
    zIndex: 1,
    pointerEvents: 'none',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
}); 