import React from 'react';
import { Platform, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';

/**
 * @file SwipeToConfirm.tsx
 * @description Robinhood-style swipe up to confirm, as a screen layout.
 *
 * The accent sheet rests as a bar along the bottom. Drag it and it rises
 * under your finger while the screen's content lifts away; release past
 * about 40% (or flick) and it fills the screen, then `onConfirm` runs, so
 * the next screen can carry on in the same colour. Short of that, it
 * springs back.
 *
 * Usage:
 *   <SwipeToConfirm label="Swipe up to log" onConfirm={logSet}>
 *     ...screen content...
 *   </SwipeToConfirm>
 *
 * `enterFromFull` starts the sheet covering the screen and lowers it into the
 * bar: the way back from a full-screen confirmation.
 *
 * Accessibility: the bar is a button whose "activate" action confirms, so
 * screen reader users never need the gesture. Reduce Motion keeps the drag
 * (it is direct manipulation) but drops the content lift and the automatic
 * fill and lowering animations.
 */

interface SwipeToConfirmProps {
  label: string;
  /** Shown once the sheet is past the point of no return. */
  releaseLabel?: string;
  onConfirm: () => void;
  children: React.ReactNode;
  enterFromFull?: boolean;
  disabled?: boolean;
}

const BAR = 104;
/** Share of the travel past which a release confirms. */
const COMMIT = 0.4;
/** Upward flick speed (px/s) that confirms from anywhere. */
const FLICK = 900;

export function SwipeToConfirm({
  label,
  releaseLabel = 'Release to log',
  onConfirm,
  children,
  enterFromFull = false,
  disabled = false,
}: SwipeToConfirmProps) {
  const colors = Colors.dark;
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const bar = BAR + insets.bottom;

  /** Screen height, and 0..1 how far the sheet has risen. */
  const height = useSharedValue(0);
  const progress = useSharedValue(enterFromFull ? 1 : 0);
  const armed = useSharedValue(false);

  const travel = () => {
    'worklet';
    return Math.max(1, height.value - bar);
  };

  const confirm = React.useCallback(() => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm();
  }, [onConfirm]);
  const tick = React.useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Coming back from a full-screen confirmation: lower the sheet into the bar.
  React.useEffect(() => {
    if (!enterFromFull) return;
    progress.value = reduceMotion ? 0 : withTiming(0, { duration: 420, easing: Easing.out(Easing.exp) });
  }, [enterFromFull, reduceMotion, progress]);

  // A light tick when the sheet crosses the point of no return, either way.
  useAnimatedReaction(
    () => progress.value >= COMMIT,
    (now, before) => {
      armed.value = now;
      if (before !== null && now !== before) runOnJS(tick)();
    },
  );

  const finish = () => {
    'worklet';
    if (reduceMotion) {
      progress.value = 1;
      runOnJS(confirm)();
      return;
    }
    progress.value = withTiming(1, { duration: 240, easing: Easing.out(Easing.cubic) }, (done) => {
      if (done) runOnJS(confirm)();
    });
  };

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .activeOffsetY([-6, 6])
    .onChange((e) => {
      progress.value = Math.min(1, Math.max(0, progress.value - e.changeY / travel()));
    })
    .onEnd((e) => {
      if (progress.value >= COMMIT || e.velocityY < -FLICK) finish();
      else progress.value = withSpring(0, { damping: 18, stiffness: 240, overshootClamping: true });
    });

  const sheetStyle = useAnimatedStyle(() => {
    const radius = interpolate(progress.value, [0, 0.85, 1], [28, 28, 0], 'clamp');
    // Read height here (not via travel()) so the style re-runs once measured;
    // until then the sheet stays parked off screen.
    const span = height.value - bar;
    return {
      opacity: height.value > 0 ? 1 : 0,
      transform: [{ translateY: span > 0 ? span * (1 - progress.value) : 10000 }],
      borderTopLeftRadius: radius,
      borderTopRightRadius: radius,
    };
  });
  // The content lifts and fades as the sheet climbs, like an order summary
  // making way for the confirmation.
  const contentStyle = useAnimatedStyle(() =>
    reduceMotion
      ? { opacity: interpolate(progress.value, [0, 0.6], [1, 0], 'clamp') }
      : {
          opacity: interpolate(progress.value, [0, 0.6], [1, 0], 'clamp'),
          transform: [{ translateY: -progress.value * 120 }, { scale: interpolate(progress.value, [0, 1], [1, 0.96]) }],
        },
  );
  const swipeLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [COMMIT - 0.08, COMMIT], [1, 0], 'clamp'),
  }));
  const releaseLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [COMMIT - 0.08, COMMIT], [0, 1], 'clamp'),
  }));
  const handleStyle = useAnimatedStyle(() => ({
    // The chevron leans upward once the release would confirm.
    transform: [{ translateY: armed.value ? -4 : 0 }],
  }));

  return (
    <View style={styles.screen} onLayout={(e: LayoutChangeEvent) => (height.value = e.nativeEvent.layout.height)}>
      <Animated.View style={[styles.content, { paddingBottom: bar }, contentStyle]}>{children}</Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View
          accessible
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityHint="Swipe up, or activate, to confirm"
          accessibilityState={{ disabled }}
          accessibilityActions={[{ name: 'activate' }]}
          onAccessibilityAction={(e) => {
            if (e.nativeEvent.actionName === 'activate' && !disabled) finish();
          }}
          style={[styles.sheet, { backgroundColor: disabled ? colors.secondary : colors.accent }, sheetStyle]}
        >
          <View style={[styles.grip, { height: BAR }]}>
            <Animated.View style={handleStyle}>
              <IconSymbol name="chevron.up" size={28} color={colors.accentForeground} />
            </Animated.View>
            <View style={styles.labels}>
              <Animated.Text style={[styles.label, { color: colors.accentForeground }, swipeLabelStyle]}>{label}</Animated.Text>
              <Animated.Text style={[styles.label, styles.overlay, { color: colors.accentForeground }, releaseLabelStyle]}>
                {releaseLabel}
              </Animated.Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  content: { flex: 1 },
  sheet: {
    ...StyleSheet.absoluteFillObject,
    // Let the pan gesture own vertical drags on web instead of scrolling.
    ...(Platform.OS === 'web' ? ({ touchAction: 'none', cursor: 'grab', userSelect: 'none' } as object) : null),
  },
  grip: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  labels: { alignItems: 'center' },
  label: {
    fontFamily: Fonts.display,
    fontSize: 20,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  overlay: { position: 'absolute' },
});
