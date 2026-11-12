import React from 'react';
import { Platform, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';

/**
 * @file SwipeToConfirm.tsx
 * @description A big bar you swipe up to confirm an action, like placing a
 * trade in Robinhood. Used to log a set or a meal in one gesture.
 *
 * Usage:
 *   <SwipeToConfirm label="Swipe up to log" onConfirm={logSet} />
 *
 * Accessibility: exposed as a button whose "activate" action confirms, so
 * screen reader and keyboard users never need the gesture.
 */

interface SwipeToConfirmProps {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/** How far up (px) the swipe must travel to count. */
const THRESHOLD = 70;
const MAX_TRAVEL = 110;

export function SwipeToConfirm({ label, onConfirm, disabled = false, height = 120, style }: SwipeToConfirmProps) {
  const colors = Colors.dark;
  const travel = useSharedValue(0);
  const flash = useSharedValue(0);

  const confirm = React.useCallback(() => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm();
  }, [onConfirm]);

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .activeOffsetY([-8, 8])
    .onUpdate((e) => {
      travel.value = Math.max(-MAX_TRAVEL, Math.min(0, e.translationY));
    })
    .onEnd(() => {
      if (travel.value <= -THRESHOLD) {
        flash.value = 1;
        flash.value = withTiming(0, { duration: 450 });
        runOnJS(confirm)();
      }
      travel.value = withSpring(0, { damping: 16, stiffness: 220 });
    });

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: travel.value * 0.6 }],
    opacity: interpolate(travel.value, [-MAX_TRAVEL, 0], [0.55, 1]),
  }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));
  const fillStyle = useAnimatedStyle(() => ({
    height: `${interpolate(travel.value, [-THRESHOLD, 0], [100, 0], 'clamp')}%`,
  }));

  return (
    <GestureDetector gesture={pan}>
      <View
        accessible
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'activate' && !disabled) confirm();
        }}
        style={[
          styles.track,
          { height, backgroundColor: disabled ? colors.secondary : colors.accent },
          style,
        ]}
      >
        <Animated.View pointerEvents="none" style={[styles.fill, fillStyle]} />
        <Animated.View pointerEvents="none" style={[styles.flash, flashStyle]} />
        <Animated.View style={[styles.content, contentStyle]}>
          <View style={styles.chevrons}>
            <IconSymbol name="chevron.up" size={24} color={colors.accentForeground} style={{ opacity: 0.45 }} />
            <IconSymbol name="chevron.up" size={24} color={colors.accentForeground} style={{ marginTop: -14 }} />
          </View>
          <Text style={[styles.label, { color: disabled ? colors.mutedForeground : colors.accentForeground }]}>
            {label}
          </Text>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    // Let the pan gesture own vertical drags on web instead of scrolling.
    ...(Platform.OS === 'web' ? ({ touchAction: 'none', cursor: 'grab', userSelect: 'none' } as object) : null),
  },
  fill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
  },
  content: {
    alignItems: 'center',
    gap: 6,
  },
  chevrons: {
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
