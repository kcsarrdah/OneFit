import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export const useWaveAnimations = () => {
  // Create animated values for wave movements
  const waveX1 = useRef(new Animated.Value(0)).current;
  const waveX2 = useRef(new Animated.Value(0)).current;
  const waveY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Horizontal wave animation 1 (slow drift)
    const waveX1Animation = Animated.loop(
      Animated.timing(waveX1, {
        toValue: -100, // Move 100 pixels left
        duration: 8000, // 8 seconds
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Horizontal wave animation 2 (medium flow)
    const waveX2Animation = Animated.loop(
      Animated.timing(waveX2, {
        toValue: -150, // Move 150 pixels left
        duration: 12000, // 12 seconds
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Vertical wave animation (gentle bobbing)
    const waveYAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(waveY, {
          toValue: -8, // Move up 8 pixels
          duration: 2500, // 2.5 seconds
          easing: Easing.bezier(0.4, 0, 0.6, 1), // Smooth ease
          useNativeDriver: true,
        }),
        Animated.timing(waveY, {
          toValue: 0, // Move back down
          duration: 2500, // 2.5 seconds
          easing: Easing.bezier(0.4, 0, 0.6, 1), // Smooth ease
          useNativeDriver: true,
        })
      ])
    );

    // Start all animations
    waveX1Animation.start();
    waveX2Animation.start();
    waveYAnimation.start();

    // Cleanup
    return () => {
      waveX1Animation.stop();
      waveX2Animation.stop();
      waveYAnimation.stop();
    };
  }, [waveX1, waveX2, waveY]);

  return {
    // Individual wave styles
    wave1Style: {
      transform: [{ translateX: waveX1 }, { translateY: waveY }]
    },
    wave2Style: {
      transform: [{ translateX: waveX2 }, { translateY: waveY }]
    },
    wave3Style: {
      transform: [{ translateX: waveX1 }, { translateY: waveY }]
    },
    
    // Simple horizontal movement
    waveXStyle: {
      transform: [{ translateX: waveX1 }]
    },
    
    // Simple vertical movement
    waveYStyle: {
      transform: [{ translateY: waveY }]
    }
  };
};