import React from 'react';
import { 
  TouchableOpacity, 
  ViewStyle, 
  StyleProp,
  Platform,
  View
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  interpolateColor,
} from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from './IconSymbol';

/**
 * @file Checkbox.tsx
 * @description A custom checkbox component with smooth animations.
 * Since React Native doesn't have a built-in checkbox, this provides a cross-platform solution.
 * 
 * Key Props:
 *   - `checked`: Boolean state of the checkbox
 *   - `onCheckedChange`: Callback when checked state changes
 *   - `size`: Size variant ('sm', 'default', 'lg')
 *   - `variant`: Color variant ('default', 'success', 'warning')
 *   - `disabled`: Whether the checkbox is disabled
 * 
 * Usage:
 *   <Checkbox 
 *     checked={isCompleted} 
 *     onCheckedChange={setIsCompleted}
 *     size="lg"
 *     variant="success"
 *   />
 */

type CheckboxSize = 'sm' | 'default' | 'lg';
type CheckboxVariant = 'default' | 'success' | 'warning' | 'destructive';

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  size?: CheckboxSize;
  variant?: CheckboxVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Checkbox = React.forwardRef<View, CheckboxProps>(
  ({ 
    checked, 
    onCheckedChange, 
    size = 'default',
    variant = 'default',
    disabled = false,
    style,
    ...props 
  }, ref) => {
    const borderColor = useThemeColor({}, 'border');
    const backgroundColor = useThemeColor({}, 'background');
    const foregroundColor = useThemeColor({}, 'foreground');
    const mutedColor = useThemeColor({}, 'mutedForeground');

    // Animation values
    const scale = useSharedValue(checked ? 1 : 0.8);
    const opacity = useSharedValue(checked ? 1 : 0);
    const backgroundProgress = useSharedValue(checked ? 1 : 0);

    // Update animations when checked state changes
    React.useEffect(() => {
      scale.value = withSpring(checked ? 1 : 0.8, {
        damping: 15,
        stiffness: 200,
      });
      opacity.value = withTiming(checked ? 1 : 0, { duration: 150 });
      backgroundProgress.value = withTiming(checked ? 1 : 0, { duration: 200 });
    }, [checked]);

    // Get variant colors
    const getVariantColors = () => {
      switch (variant) {
        case 'success':
          return {
            checkedBackground: '#10B981', // green-500
            checkedBorder: '#10B981',
            checkColor: '#FFFFFF',
          };
        case 'warning':
          return {
            checkedBackground: '#F59E0B', // yellow-500
            checkedBorder: '#F59E0B',
            checkColor: '#FFFFFF',
          };
        case 'destructive':
          return {
            checkedBackground: '#EF4444', // red-500
            checkedBorder: '#EF4444',
            checkColor: '#FFFFFF',
          };
        default:
          return {
            checkedBackground: '#3B82F6', // blue-500
            checkedBorder: '#3B82F6',
            checkColor: '#FFFFFF',
          };
      }
    };

    // Get size dimensions
    const getSizeDimensions = () => {
      switch (size) {
        case 'sm':
          return {
            width: 16,
            height: 16,
            borderRadius: 3,
            iconSize: 10,
          };
        case 'lg':
          return {
            width: 28,
            height: 28,
            borderRadius: 6,
            iconSize: 18,
          };
        default:
          return {
            width: 20,
            height: 20,
            borderRadius: 4,
            iconSize: 14,
          };
      }
    };

    const variantColors = getVariantColors();
    const sizeDimensions = getSizeDimensions();

    // Animated styles for the container
    const animatedContainerStyle = useAnimatedStyle(() => {
      const currentBackgroundColor = interpolateColor(
        backgroundProgress.value,
        [0, 1],
        [backgroundColor, variantColors.checkedBackground]
      );

      const currentBorderColor = interpolateColor(
        backgroundProgress.value,
        [0, 1],
        [borderColor, variantColors.checkedBorder]
      );

      return {
        backgroundColor: currentBackgroundColor,
        borderColor: currentBorderColor,
        transform: [{ scale: scale.value }],
      };
    });

    // Animated styles for the check icon
    const animatedIconStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
      };
    });

    const handlePress = () => {
      if (!disabled) {
        onCheckedChange(!checked);
      }
    };

    return (
      <TouchableOpacity
        ref={ref}
        onPress={handlePress}
        disabled={disabled}
        style={[
          {
            width: sizeDimensions.width,
            height: sizeDimensions.height,
          },
          disabled && { opacity: 0.5 },
          style
        ]}
        activeOpacity={0.7}
        {...props}
      >
        <Animated.View
          style={[
            {
              width: sizeDimensions.width,
              height: sizeDimensions.height,
              borderRadius: sizeDimensions.borderRadius,
              borderWidth: 2,
              alignItems: 'center',
              justifyContent: 'center',
              // Shadow for better visual separation
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                },
                android: {
                  elevation: 2,
                },
              }),
            },
            animatedContainerStyle,
          ]}
        >
        <Animated.View style={animatedIconStyle}>
        <Animated.Text style={{ 
            color: variantColors.checkColor, 
            fontSize: sizeDimensions.iconSize,
            fontWeight: 'bold'
        }}>
            ✓
        </Animated.Text>
        </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    );
  }
);

Checkbox.displayName = 'Checkbox';