import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors, WaterColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';

import { 
  DEFAULT_GOAL, 
  DEFAULT_LOG_AMOUNT, 
  getStorageKey,
  type HistoryEntry,
  type HydrationTrackerProps 
} from '@/constants/WaterTracking';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HydrationTracker({ userName = "Jane" }: HydrationTrackerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const foregroundColor = useThemeColor({}, 'foreground');
  const mutedForegroundColor = useThemeColor({}, 'mutedForeground');
  const cardColor = useThemeColor({}, 'card');

  // State
  const [dailyGoal, setDailyGoal] = useState(DEFAULT_GOAL);
  const [currentIntake, setCurrentIntake] = useState(0);
  const [defaultLogAmount, setDefaultLogAmount] = useState(DEFAULT_LOG_AMOUNT);
  const [isLoaded, setIsLoaded] = useState(false);

  // Simple animation state using React state (no Animated API)
  const [shimmerOpacity, setShimmerOpacity] = useState(0.3);
  const [surfaceOffset, setSurfaceOffset] = useState(0);

  // Simple animation using setTimeout
  useEffect(() => {
    let shimmerInterval: ReturnType<typeof setInterval>;
    let surfaceInterval: ReturnType<typeof setInterval>; 
    
    // Simple opacity animation
    const animateShimmer = () => {
      shimmerInterval = setInterval(() => {
        setShimmerOpacity(prev => prev === 0.3 ? 0.7 : 0.3);
      }, 1500);
    };

    // Simple position animation
    const animateSurface = () => {
      surfaceInterval = setInterval(() => {
        setSurfaceOffset(prev => prev === 0 ? -2 : 0);
      }, 2000);
    };

    animateShimmer();
    animateSurface();

    return () => {
      clearInterval(shimmerInterval);
      clearInterval(surfaceInterval);
    };
  }, []);

  const loadStateFromStorage = useCallback(async () => {
    try {
      const storedGoal = await AsyncStorage.getItem(getStorageKey('dailyGoal'));
      const storedDefaultLogAmount = await AsyncStorage.getItem(getStorageKey('defaultLogAmount'));
      const storedIntake = await AsyncStorage.getItem(getStorageKey('currentIntake'));
      const storedDate = await AsyncStorage.getItem(getStorageKey('intakeDate'));

      const today = new Date().toISOString().split('T')[0];
      const currentGoal = storedGoal ? JSON.parse(storedGoal) : DEFAULT_GOAL;
      const currentLogAmount = storedDefaultLogAmount ? JSON.parse(storedDefaultLogAmount) : DEFAULT_LOG_AMOUNT;

      setDailyGoal(currentGoal);
      setDefaultLogAmount(currentLogAmount);

      if (storedDate === today && storedIntake) {
        setCurrentIntake(JSON.parse(storedIntake));
      } else {
        setCurrentIntake(0);
        await AsyncStorage.setItem(getStorageKey('currentIntake'), JSON.stringify(0));
        await AsyncStorage.setItem(getStorageKey('intakeDate'), today);
        await updateHistory(0, currentGoal, today, true);
        console.log("New Day! Your hydration progress has been reset for today.");
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading state from storage:', error);
      setIsLoaded(true);
    }
  }, []);

  const updateHistory = useCallback(async (intake: number, goal: number, date: string, isNewDayReset = false) => {
    try {
      const storedHistory = await AsyncStorage.getItem(getStorageKey('hydrationHistory'));
      let history: HistoryEntry[] = storedHistory ? JSON.parse(storedHistory) : [];

      const todayEntryIndex = history.findIndex(entry => entry.date === date);

      if (todayEntryIndex > -1) {
        history[todayEntryIndex] = { date, intake, goal };
      } else {
        history.push({ date, intake, goal });
      }

      history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const limitedHistory = history.slice(0, 30);
      await AsyncStorage.setItem(getStorageKey('hydrationHistory'), JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error updating history:', error);
    }
  }, []);

  useEffect(() => {
    loadStateFromStorage();
  }, [loadStateFromStorage]);

  useEffect(() => {
    if (isLoaded) {
      const saveData = async () => {
        try {
          await AsyncStorage.setItem(getStorageKey('currentIntake'), JSON.stringify(currentIntake));
          const today = new Date().toISOString().split('T')[0];
          await updateHistory(currentIntake, dailyGoal, today);
        } catch (error) {
          console.error('Error saving data:', error);
        }
      };
      saveData();
    }
  }, [currentIntake, dailyGoal, isLoaded, updateHistory]);

  const handleLogWater = () => {
    if (defaultLogAmount <= 0) {
      console.error("Invalid log amount. Must be positive.");
      return;
    }
    const newIntake = currentIntake + defaultLogAmount;
    setCurrentIntake(newIntake);
  };

  const handleResetWater = () => {
    Alert.alert(
      "Reset Water Intake",
      `Are you sure you want to reset your water intake to 0ml?\n\nCurrent intake: ${currentIntake}ml`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setCurrentIntake(0);
            console.log("Water intake reset to 0ml");
          }
        }
      ]
    );
  };

  const fillPercentage = dailyGoal > 0 ? Math.min((currentIntake / dailyGoal) * 100, 100) : 0;
  const remainingAmount = Math.max(0, dailyGoal - currentIntake);
  const waterHeight = (fillPercentage / 100) * SCREEN_HEIGHT;
  const waterColor = WaterColors.high;

  if (!isLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <Text style={[styles.loadingText, { color: mutedForegroundColor }]}>
          Loading Hydration Data...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Text Content Area */}
      <View style={styles.textArea}>
        <Text style={[styles.intakeText, { color: foregroundColor }]}>
          {currentIntake.toLocaleString()}
          <Text style={[styles.unitText, { color: foregroundColor }]}>ml</Text>
        </Text>
        <Text style={[styles.remainingText, { color: mutedForegroundColor }]}>
          Remaining {remainingAmount.toLocaleString()}ml of {dailyGoal.toLocaleString()}ml
        </Text>
        <Text style={[styles.progressText, { color: foregroundColor }]}>
          {Math.round(fillPercentage)}% Complete
        </Text>
      </View>

      {/* Buttons Area */}
      <View style={styles.buttonArea}>
        <Button
          onPress={handleLogWater}
          style={[styles.addButton, { 
            backgroundColor: cardColor, 
            borderColor: WaterColors.primary,
            shadowColor: WaterColors.primary,
          }]}
        >
          <IconSymbol 
            name="drop.fill" 
            size={28} 
            color={WaterColors.primary} 
          />
        </Button>
        <Text style={[styles.addButtonLabel, { color: WaterColors.primary }]}>
          +{defaultLogAmount}ml
        </Text>

        {currentIntake > 0 && (
          <>
            <Button
              onPress={handleResetWater}
              style={[styles.resetButton, { 
                backgroundColor: cardColor, 
                borderColor: colors.destructive,
              }]}
            >
              <IconSymbol 
                name="arrow.counterclockwise" 
                size={20} 
                color={colors.destructive} 
              />
            </Button>
            <Text style={[styles.resetButtonLabel, { color: colors.destructive }]}>
              Reset
            </Text>
          </>
        )}
      </View>

      {/* Water Container with SIMPLE STATE-BASED ANIMATIONS */}
      <View 
        style={[
          styles.waterContainer,
          { 
            height: waterHeight,
            backgroundColor: waterColor
          }
        ]}
      >
        {/* Simple animated water surface */}
        <View style={[
          styles.waterSurface, 
          { 
            backgroundColor: WaterColors.surface + '60',
            transform: [{ translateY: surfaceOffset }] // Simple state-based animation
          }
        ]} />
        
        {/* Simple animated shimmer */}
        <View style={[
          styles.waterShimmer, 
          { 
            backgroundColor: WaterColors.light + '60',
            opacity: shimmerOpacity // Simple state-based animation
          }
        ]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  textArea: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    zIndex: 20,
  },
  intakeText: {
    fontSize: 64,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  unitText: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  remainingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  buttonArea: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonLabel: {
    position: 'absolute',
    top: 90,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  resetButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  resetButtonLabel: {
    position: 'absolute',
    top: 70,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  waterContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  waterSurface: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  waterShimmer: {
    position: 'absolute',
    top: 8,
    left: '20%',
    right: '20%',
    height: 4,
    borderRadius: 2,
  },
});