import React from 'react';
import { 
  TextInput, 
  StyleSheet, 
  View, 
  TextInputProps,
  ViewStyle,
  TextStyle,
  Platform
} from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';

interface TextareaProps extends Omit<TextInputProps, 'style'> {
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  error?: boolean;
  rows?: number;
}

export const Textarea = React.forwardRef<TextInput, TextareaProps>(
  ({ 
    containerStyle, 
    inputStyle, 
    error,
    placeholder,
    editable = true,
    rows = 4,
    ...props 
  }, ref) => {
    const backgroundColor = useThemeColor({}, 'background');
    const borderColor = useThemeColor({}, 'border');
    const textColor = useThemeColor({}, 'text');
    const placeholderColor = useThemeColor({}, 'tabIconDefault');
    const destructiveColor = useThemeColor({}, 'destructive');

    // Calculate height based on rows (assuming each row is ~20px)
    const minHeight = Math.max(80, rows * 20);

    return (
      <View style={[styles.container, containerStyle]}>
        <TextInput
          ref={ref}
          style={[
            styles.input,
            {
              backgroundColor,
              borderColor: error ? destructiveColor : borderColor,
              color: textColor,
              minHeight,
            },
            !editable && styles.disabled,
            inputStyle,
          ]}
          placeholderTextColor={placeholderColor}
          editable={editable}
          placeholder={placeholder}
          multiline
          textAlignVertical="top"
          {...props}
        />
      </View>
    );
  }
);

Textarea.displayName = 'Textarea';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderRadius: 6, // equivalent to rounded-md
    paddingHorizontal: 12, // equivalent to px-3
    paddingVertical: 8, // equivalent to py-2
    fontSize: 16, // equivalent to text-base
    ...Platform.select({
      ios: {
        // iOS specific styles
      },
      android: {
        // Android specific styles
      },
    }),
  },
  disabled: {
    opacity: 0.5,
  },
});