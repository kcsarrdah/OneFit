import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { useThemeColor } from '../../hooks/useThemeColor';
import { IconSymbol } from './IconSymbol';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DialogProps {
  visible: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  animationType?: 'none' | 'slide' | 'fade';
}

interface DialogContentProps {
  children: React.ReactNode;
  style?: any;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  style?: any;
}

interface DialogFooterProps {
  children: React.ReactNode;
  style?: any;
}

interface DialogTitleProps {
  children: React.ReactNode;
  style?: any;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  style?: any;
}

export function Dialog({ visible, onDismiss, children, animationType = 'fade' }: DialogProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const overlayColor = useThemeColor({}, 'overlay');
  
  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  // Animation styles
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Handle visibility changes
  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1);
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withSpring(0.9);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <Animated.View style={[styles.overlay, { backgroundColor: overlayColor }, overlayStyle]}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.contentContainer, { backgroundColor }, contentStyle]}>
              {children}
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

export function DialogContent({ children, style }: DialogContentProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={[styles.content, { backgroundColor, borderColor }, style]}>
      {children}
    </View>
  );
}

export function DialogHeader({ children, style }: DialogHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      {children}
    </View>
  );
}

export function DialogFooter({ children, style }: DialogFooterProps) {
  return (
    <View style={[styles.footer, style]}>
      {children}
    </View>
  );
}

export function DialogTitle({ children, style }: DialogTitleProps) {
  const textColor = useThemeColor({}, 'text');

  return (
    <Animated.Text style={[styles.title, { color: textColor }, style]}>
      {children}
    </Animated.Text>
  );
}

export function DialogDescription({ children, style }: DialogDescriptionProps) {
  const textColor = useThemeColor({}, 'tabIconDefault');

  return (
    <Animated.Text style={[styles.description, { color: textColor }, style]}>
      {children}
    </Animated.Text>
  );
}

export function DialogClose({ onPress }: { onPress: () => void }) {
  const textColor = useThemeColor({}, 'text');

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.closeButton}
      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
    >
      <IconSymbol 
        name="chevron.right" 
        size={20} 
        color={textColor}
        style={{ transform: [{ rotate: '45deg' }] }}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '90%',
    maxWidth: 500,
    maxHeight: SCREEN_HEIGHT * 0.8,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
});