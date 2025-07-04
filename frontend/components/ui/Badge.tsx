import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  StyleProp
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

/**
 * @file Badge.tsx
 * @description A badge component for displaying categorized labels like muscle groups.
 * 
 * Key Props:
 *   - `variant`: Muscle group variants or standard color variants
 *   - `size`: 'sm', 'default', 'lg'
 *   - `children`: Badge text content
 * 
 * Usage:
 *   <Badge variant="chest">Chest</Badge>
 *   <Badge variant="back" size="sm">Back</Badge>
 *   <Badge variant="destructive">Error</Badge>
 */

type BadgeVariant = 
  // Muscle group variants
  | 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core'
  // Standard variants
  | 'default' | 'secondary' | 'destructive' | 'outline';

type BadgeSize = 'sm' | 'default' | 'lg';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Badge = React.forwardRef<View, BadgeProps>(
  ({ 
    variant = 'default', 
    size = 'default', 
    children, 
    style, 
    textStyle,
    ...props 
  }, ref) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    // Get variant styles (background and text colors)
    const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
      switch (variant) {
        case 'chest':
          return {
            container: {
              backgroundColor: '#EF4444', // red-500
            },
            text: {
              color: '#FFFFFF',
            }
          };
        case 'back':
          return {
            container: {
              backgroundColor: '#3B82F6', // blue-500
            },
            text: {
              color: '#FFFFFF',
            }
          };
        case 'shoulders':
          return {
            container: {
              backgroundColor: '#F59E0B', // yellow-500
            },
            text: {
              color: '#FFFFFF',
            }
          };
        case 'arms':
          return {
            container: {
              backgroundColor: '#10B981', // green-500
            },
            text: {
              color: '#FFFFFF',
            }
          };
        case 'legs':
          return {
            container: {
              backgroundColor: '#F97316', // orange-500
            },
            text: {
              color: '#FFFFFF',
            }
          };
        case 'core':
          return {
            container: {
              backgroundColor: '#14B8A6', // teal-500
            },
            text: {
              color: '#FFFFFF',
            }
          };
        case 'secondary':
          return {
            container: {
              backgroundColor: colors.secondary,
            },
            text: {
              color: colors.secondaryForeground,
            }
          };
        case 'destructive':
          return {
            container: {
              backgroundColor: colors.destructive,
            },
            text: {
              color: colors.destructiveForeground,
            }
          };
        case 'outline':
          return {
            container: {
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: colors.border,
            },
            text: {
              color: colors.foreground,
            }
          };
        default: // 'default'
          return {
            container: {
              backgroundColor: colors.primary,
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
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
            },
            text: {
              fontSize: 12,
              fontWeight: '600',
            }
          };
        case 'lg':
          return {
            container: {
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
            },
            text: {
              fontSize: 16,
              fontWeight: '700',
            }
          };
        default: // 'default'
          return {
            container: {
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 10,
            },
            text: {
              fontSize: 14,
              fontWeight: '600',
            }
          };
      }
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    return (
      <View
        ref={ref}
        style={[
          styles.baseContainer,
          sizeStyles.container,
          variantStyles.container,
          style
        ]}
        {...props}
      >
        <Text 
          style={[
            styles.baseText,
            sizeStyles.text,
            variantStyles.text,
            textStyle
          ]}
        >
          {children}
        </Text>
      </View>
    );
  }
);

Badge.displayName = 'Badge';

const styles = StyleSheet.create({
  baseContainer: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});