import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text,
  TextInput, 
  TouchableOpacity,
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  Platform,
  TextInputProps
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

/**
 * @file NumberInput.tsx
 * @description A specialized number input component for weight, reps, and other numeric values.
 * Extends the base Input component with increment/decrement controls and number validation.
 * 
 * Key Props:
 *   - `value`: Current numeric value
 *   - `onValueChange`: Callback when value changes
 *   - `min`: Minimum allowed value
 *   - `max`: Maximum allowed value
 *   - `step`: Increment/decrement step (default: 1)
 *   - `precision`: Decimal places (default: 0 for integers)
 *   - `showControls`: Whether to show +/- buttons (default: true)
 * 
 * Usage:
 *   <NumberInput 
 *     value={weight} 
 *     onValueChange={setWeight}
 *     step={0.5}
 *     precision={1}
 *     placeholder="Weight (kg)"
 *   />
 */

interface NumberInputProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'keyboardType'> {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  showControls?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  error?: boolean;
  suffix?: string; // e.g., "kg", "lbs", "reps"
}

export const NumberInput = React.forwardRef<TextInput, NumberInputProps>(
  ({ 
    value,
    onValueChange,
    min,
    max,
    step = 1,
    precision = 0,
    showControls = true,
    containerStyle,
    inputStyle,
    error,
    suffix,
    placeholder,
    editable = true,
    ...props 
  }, ref) => {
    const backgroundColor = useThemeColor({}, 'background');
    const borderColor = useThemeColor({}, 'border');
    const textColor = useThemeColor({}, 'text');
    const placeholderColor = useThemeColor({}, 'tabIconDefault');
    const destructiveColor = useThemeColor({}, 'destructive');
    const mutedColor = useThemeColor({}, 'mutedForeground');
    const accentColor = useThemeColor({}, 'accent');

    const [inputValue, setInputValue] = useState(formatValue(value));

    // Format value based on precision
    function formatValue(val: number): string {
      if (isNaN(val) || val === 0) return '';
      return precision > 0 ? val.toFixed(precision) : val.toString();
    }

    // Validate and constrain value
    const constrainValue = useCallback((val: number): number => {
      if (isNaN(val)) return 0;
      
      let constrainedValue = val;
      if (min !== undefined) constrainedValue = Math.max(min, constrainedValue);
      if (max !== undefined) constrainedValue = Math.min(max, constrainedValue);
      
      // Round to precision
      if (precision > 0) {
        constrainedValue = parseFloat(constrainedValue.toFixed(precision));
      } else {
        constrainedValue = Math.round(constrainedValue);
      }
      
      return constrainedValue;
    }, [min, max, precision]);

    // Handle text input changes
    const handleTextChange = useCallback((text: string) => {
      setInputValue(text);
      
      if (text === '') {
        onValueChange(0);
        return;
      }

      const numericValue = parseFloat(text);
      if (!isNaN(numericValue)) {
        const constrainedValue = constrainValue(numericValue);
        onValueChange(constrainedValue);
      }
    }, [constrainValue, onValueChange]);

    // Handle increment
    const handleIncrement = useCallback(() => {
      const newValue = constrainValue(value + step);
      onValueChange(newValue);
      setInputValue(formatValue(newValue));
    }, [value, step, constrainValue, onValueChange]);

    // Handle decrement
    const handleDecrement = useCallback(() => {
      const newValue = constrainValue(value - step);
      onValueChange(newValue);
      setInputValue(formatValue(newValue));
    }, [value, step, constrainValue, onValueChange]);

    // Update input value when prop value changes
    React.useEffect(() => {
      setInputValue(formatValue(value));
    }, [value, precision]);

    // Handle focus events to manage input display
    const handleFocus = useCallback(() => {
      if (value === 0) {
        setInputValue('');
      }
    }, [value]);

    const handleBlur = useCallback(() => {
      if (inputValue === '' || isNaN(parseFloat(inputValue))) {
        setInputValue(formatValue(0));
        onValueChange(0);
      } else {
        const finalValue = constrainValue(parseFloat(inputValue));
        setInputValue(formatValue(finalValue));
        if (finalValue !== value) {
          onValueChange(finalValue);
        }
      }
    }, [inputValue, value, constrainValue, onValueChange]);

    return (
      <View style={[styles.container, containerStyle]}>
        <View style={[
          styles.inputContainer,
          {
            backgroundColor,
            borderColor: error ? destructiveColor : borderColor,
          },
          !editable && styles.disabled,
        ]}>
          {/* Decrement Button */}
          {showControls && (
            <TouchableOpacity
              onPress={handleDecrement}
              disabled={!editable || (min !== undefined && value <= min)}
              style={[
                styles.controlButton,
                styles.decrementButton,
                (!editable || (min !== undefined && value <= min)) && styles.disabledButton
              ]}
              activeOpacity={0.6}
            >
<Text style={{ 
  color: (!editable || (min !== undefined && value <= min)) ? mutedColor : accentColor,
  fontSize: 16,
  fontWeight: 'bold'
}}>
  −
</Text>
            </TouchableOpacity>
          )}

          {/* Text Input */}
          <TextInput
            ref={ref}
            style={[
              styles.textInput,
              { color: textColor },
              inputStyle,
            ]}
            value={inputValue}
            onChangeText={handleTextChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor={placeholderColor}
            keyboardType="numeric"
            editable={editable}
            textAlign="center"
            selectTextOnFocus
            {...props}
          />

          {/* Suffix */}
          {suffix && (
            <Text style={[styles.suffix, { color: mutedColor }]}>
              {suffix}
            </Text>
          )}

          {/* Increment Button */}
          {showControls && (
            <TouchableOpacity
              onPress={handleIncrement}
              disabled={!editable || (max !== undefined && value >= max)}
              style={[
                styles.controlButton,
                styles.incrementButton,
                (!editable || (max !== undefined && value >= max)) && styles.disabledButton
              ]}
              activeOpacity={0.6}
            >
<Text style={{ 
  color: (!editable || (max !== undefined && value >= max)) ? mutedColor : accentColor,
  fontSize: 16,
  fontWeight: 'bold'
}}>
  +
</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

NumberInput.displayName = 'NumberInput';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 12,
    textAlign: 'center',
    ...Platform.select({
      ios: {
        // iOS specific styles
      },
      android: {
        // Android specific styles
      },
    }),
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  decrementButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  incrementButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  disabledButton: {
    opacity: 0.3,
  },
  suffix: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});