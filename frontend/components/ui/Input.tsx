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

interface InputProps extends Omit<TextInputProps, 'style'> {
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  error?: boolean;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ 
    containerStyle, 
    inputStyle, 
    error,
    placeholder,
    editable = true,
    ...props 
  }, ref) => {
    const backgroundColor = useThemeColor({}, 'background');
    const borderColor = useThemeColor({}, 'border');
    const textColor = useThemeColor({}, 'text');
    const placeholderColor = useThemeColor({}, 'tabIconDefault');
    const destructiveColor = useThemeColor({}, 'destructive');

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
            },
            !editable && styles.disabled,
            inputStyle,
          ]}
          placeholderTextColor={placeholderColor}
          editable={editable}
          placeholder={placeholder}
          {...props}
        />
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    height: 40, // equivalent to h-10
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