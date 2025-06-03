import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  TouchableOpacityProps,
  Animated,
  View,
  StyleProp
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

/**
 * @file Button.tsx
 * @description A customizable button component for React Native.
 * Converted from web version to maintain same API and functionality.
 * 
 * Key Props:
 *   - `variant`: 'default', 'destructive', 'outline', 'secondary', 'ghost', 'link'
 *   - `size`: 'default', 'sm', 'lg', 'icon'
 *   - `asChild`: Boolean. If true, renders children without button styling
 *   - Standard TouchableOpacityProps are also accepted
 * 
 * Usage:
 *   <Button onPress={() => console.log('pressed')}>Click Me</Button>
 *   <Button variant="destructive" size="lg">Delete</Button>
 *   <Button variant="ghost" size="icon"><IconComponent /></Button>
 */

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>; 
}

export const Button = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, ButtonProps>(
  ({ 
    variant = 'default', 
    size = 'default', 
    asChild = false, 
    children, 
    style, 
    textStyle,
    disabled,
    onPressIn,
    onPressOut,
    ...props 
  }, ref) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    
    // Animation for scale effect
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = (event: any) => {
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
      onPressIn?.(event);
    };

    const handlePressOut = (event: any) => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
      onPressOut?.(event);
    };

    // Get variant styles
    const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
      switch (variant) {
        case 'default':
          return {
            container: {
              backgroundColor: colors.primary,
              borderWidth: 0,
            },
            text: {
              color: colors.primaryForeground,
            }
          };
        case 'destructive':
          return {
            container: {
              backgroundColor: colors.destructive,
              borderWidth: 0,
            },
            text: {
              color: colors.destructiveForeground,
            }
          };
        case 'outline':
          return {
            container: {
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
            },
            text: {
              color: colors.foreground,
            }
          };
        case 'secondary':
          return {
            container: {
              backgroundColor: colors.secondary,
              borderWidth: 0,
            },
            text: {
              color: colors.secondaryForeground,
            }
          };
        case 'ghost':
          return {
            container: {
              backgroundColor: 'transparent',
              borderWidth: 0,
            },
            text: {
              color: colors.foreground,
            }
          };
        case 'link':
          return {
            container: {
              backgroundColor: 'transparent',
              borderWidth: 0,
              paddingHorizontal: 0,
              paddingVertical: 0,
              height: 'auto' as any,
            },
            text: {
              color: colors.primary,
              textDecorationLine: 'underline',
            }
          };
        default:
          return {
            container: {
              backgroundColor: colors.primary,
              borderWidth: 0,
            },
            text: {
              color: colors.primaryForeground,
            }
          };
      }
    };

    // Get size styles
    const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
      switch (size) {
        case 'sm':
          return {
            container: {
              height: 36,
              paddingHorizontal: 12,
              borderRadius: 6,
            },
            text: {
              fontSize: 14,
            }
          };
        case 'lg':
          return {
            container: {
              height: 44,
              paddingHorizontal: 32,
              borderRadius: 6,
            },
            text: {
              fontSize: 16,
            }
          };
        case 'icon':
          return {
            container: {
              height: 40,
              width: 40,
              paddingHorizontal: 0,
              paddingVertical: 0,
            },
            text: {
              fontSize: 14,
            }
          };
        default: // 'default'
          return {
            container: {
              height: 40,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 6,
            },
            text: {
              fontSize: 14,
            }
          };
      }
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    // If asChild is true, render children directly without button styling
    if (asChild) {
      return <View>{children}</View>;
    }

    // Check if children is a string to render as text, or render as-is for icons/components
    const renderContent = () => {
      if (typeof children === 'string') {
        return (
          <Text 
            style={[
              styles.baseText,
              sizeStyles.text,
              variantStyles.text,
              disabled && styles.disabledText,
              textStyle
            ]}
          >
            {children}
          </Text>
        );
      }
      return children;
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          ref={ref}
          style={[
            styles.baseContainer,
            sizeStyles.container,
            variantStyles.container,
            disabled && styles.disabledContainer,
            style
          ]}
          disabled={disabled}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
          {...props}
        >
          {renderContent()}
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  baseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    // Shadow for elevation
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  baseText: {
    fontWeight: '500',
    textAlign: 'center',
  },
  disabledContainer: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});