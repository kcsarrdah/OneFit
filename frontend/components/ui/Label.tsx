import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';

interface LabelProps {
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  onPress?: () => void;
  // Add any other props you need
}

export const Label = React.forwardRef<Text, LabelProps>(
  ({ children, style, textStyle, disabled, onPress, ...props }, ref) => {
    const textColor = useThemeColor({}, 'text');
    const disabledColor = useThemeColor({}, 'tabIconDefault');

    // If onPress is provided, wrap in TouchableOpacity
    if (onPress) {
      return (
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled}
          style={[styles.container, style]}
          {...props}
        >
          <Text
            ref={ref}
            style={[
              styles.text,
              { color: disabled ? disabledColor : textColor },
              textStyle,
            ]}
          >
            {children}
          </Text>
        </TouchableOpacity>
      );
    }

    // Otherwise, just render Text
    return (
      <Text
        ref={ref}
        style={[
          styles.text,
          { color: disabled ? disabledColor : textColor },
          textStyle,
        ]}
        {...props}
      >
        {children}
      </Text>
    );
  }
);

Label.displayName = 'Label';

const styles = StyleSheet.create({
  container: {
    // Container styles if needed
  },
  text: {
    fontSize: 14, // equivalent to text-sm
    fontWeight: '500', // equivalent to font-medium
    lineHeight: 20, // equivalent to leading-none
  },
});