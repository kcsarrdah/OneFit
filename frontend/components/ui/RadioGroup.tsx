import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { IconSymbol } from './IconSymbol';

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

interface RadioGroupItemProps {
  value: string;
  id?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

// Create a context to share the radio group state
const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}>({});

export const RadioGroup = React.forwardRef<View, RadioGroupProps>(
  ({ value, onValueChange, children, disabled, style }, ref) => {
    return (
      <RadioGroupContext.Provider value={{ value, onValueChange, disabled }}>
        <View ref={ref} style={[styles.container, style]}>
          {children}
        </View>
      </RadioGroupContext.Provider>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export const RadioGroupItem = React.forwardRef<View, RadioGroupItemProps>(
  ({ value, disabled: itemDisabled, style }, ref) => {
    const { value: groupValue, onValueChange, disabled: groupDisabled } = React.useContext(RadioGroupContext);
    const disabled = itemDisabled || groupDisabled;
    const isSelected = groupValue === value;

    const primaryColor = useThemeColor({}, 'primary');
    const borderColor = useThemeColor({}, 'border');
    const backgroundColor = useThemeColor({}, 'background');

    const handlePress = () => {
      if (!disabled && onValueChange) {
        onValueChange(value);
      }
    };

    return (
      <TouchableOpacity
        ref={ref}
        onPress={handlePress}
        disabled={disabled}
        style={[
          styles.radioItem,
          {
            borderColor: isSelected ? primaryColor : borderColor,
            backgroundColor,
          },
          disabled && styles.disabled,
          style,
        ]}
        accessibilityRole="radio"
        accessibilityState={{ checked: isSelected, disabled }}
      >
        <View
          style={[
            styles.radioCircle,
            { borderColor: isSelected ? primaryColor : borderColor },
          ]}
        >
          {isSelected && (
            <View
              style={[
                styles.radioSelected,
                { backgroundColor: primaryColor },
              ]}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

RadioGroupItem.displayName = 'RadioGroupItem';

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  disabled: {
    opacity: 0.5,
  },
});