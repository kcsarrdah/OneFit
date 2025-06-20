import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export const useSimpleWaterAnimations = () => {
  // Simple up/down bobbing animation
  const bobValue = useRef(new Animated.Value(0)).current;
  
  // Simple opacity shimmer animation
  const shimmerValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Gentle bobbing animation (up and down movement)
    const bobAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bobValue, {
          toValue: -3, // Move up 3 pixels
          duration: 2000, // 2 seconds
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bobValue, {
          toValue: 0, // Move back to original position
          duration: 2000, // 2 seconds
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      ])
    );

    // Gentle shimmer animation (opacity change)
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 0.8, // More opaque
          duration: 1500, // 1.5 seconds
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0.3, // Less opaque
          duration: 1500, // 1.5 seconds
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        })
      ])
    );

    // Start animations
    bobAnimation.start();
    shimmerAnimation.start();

    // Cleanup
    return () => {
      bobAnimation.stop();
      shimmerAnimation.stop();
    };
  }, [bobValue, shimmerValue]);

  return {
    // Simple bobbing style for water surface
    surfaceBobStyle: {
      transform: [{ translateY: bobValue }]
    },
    
    // Simple shimmer style for water effects
    shimmerStyle: {
      opacity: shimmerValue
    }
  };
};