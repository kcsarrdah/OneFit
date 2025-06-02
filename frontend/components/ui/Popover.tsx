import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

/**
 * @file Popover.tsx
 * @description A mobile-optimized popover component using Modal.
 * Simpler and more mobile-friendly than web popovers.
 */

interface PopoverProps {
  children: React.ReactNode;
}

interface PopoverTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface PopoverContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}

interface PopoverContextType {
  isOpen: boolean;
  openPopover: () => void;
  closePopover: () => void;
}

const PopoverContext = React.createContext<PopoverContextType | null>(null);

export const Popover: React.FC<PopoverProps> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  const openPopover = React.useCallback(() => {
    setIsOpen(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  }, [scaleAnim]);

  const closePopover = React.useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start(() => {
      setIsOpen(false);
    });
  }, [scaleAnim]);

  return (
    <PopoverContext.Provider value={{ isOpen, openPopover, closePopover }}>
      {children}
    </PopoverContext.Provider>
  );
};

export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ 
  children, 
  asChild = false 
}) => {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error('PopoverTrigger must be used within Popover');

  const { openPopover } = context;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onPress: openPopover,
    } as any);
  }

  return (
    <TouchableOpacity onPress={openPopover} activeOpacity={0.8}>
      {children}
    </TouchableOpacity>
  );
};

export const PopoverContent: React.FC<PopoverContentProps> = ({ 
  children, 
  style,
  side = 'top',
  align = 'center'
}) => {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error('PopoverContent must be used within Popover');

  const { isOpen, closePopover } = context;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isOpen) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }).start();
    }
  }, [isOpen, scaleAnim]);

  if (!isOpen) return null;

  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="fade"
      onRequestClose={closePopover}
    >
      <TouchableWithoutFeedback onPress={closePopover}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.content,
                {
                  backgroundColor: colors.popover,
                  borderColor: colors.border,
                  transform: [{ scale: scaleAnim }],
                },
                style,
              ]}
            >
              {children}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    maxWidth: 300,
    minWidth: 200,
    // Shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});