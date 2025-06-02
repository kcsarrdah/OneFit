import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/Popover';
import type { FastingMilestone } from '@/constants/fastingMilestones';

/**
 * @file CircularProgress.tsx
 * @description A custom circular progress bar component for React Native.
 *
 * Purpose:
 *   - Visually represents the progress of a fast using a gradient-filled circle
 *   - Displays remaining time and current status
 *   - Shows clickable milestone markers with popover details
 *
 * Key Props:
 *   - `percentage`: Progress percentage (0-100)
 *   - `size`: Circle diameter in pixels (default: 200)
 *   - `strokeWidth`: Progress bar thickness (default: 15)
 *   - `label`: Text label inside circle
 *   - `timeRemaining`: Formatted time string
 *   - `milestones`: Array of FastingMilestone objects
 *   - `goalDurationSeconds`: Total fast duration for milestone positioning
 */

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  timeRemaining?: string;
  milestones?: FastingMilestone[];
  goalDurationSeconds?: number;
}

export function CircularProgress({
  percentage,
  size = 200,
  strokeWidth = 15,
  label,
  timeRemaining,
  milestones = [],
  goalDurationSeconds = 0,
}: CircularProgressProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  // Create unique gradient ID
  const gradientId = React.useMemo(() => 
    `progressGradient-${Math.random().toString(36).substring(7)}`, []
  );

  // Filter milestones that fit within the goal duration
  const filteredMilestones = React.useMemo(() => {
    if (!goalDurationSeconds || goalDurationSeconds <= 0) return [];
    return milestones.filter(
      (m) => m.timeHours * 3600 <= goalDurationSeconds && m.timeHours > 0
    );
  }, [milestones, goalDurationSeconds]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* SVG Progress Circle */}
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.accent} stopOpacity={1} />
            <Stop offset="100%" stopColor={colors.accentGradientEnd} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        
        {/* Background Circle */}
        <Circle
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        
        {/* Progress Circle */}
        <Circle
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Center Content */}
      <View style={styles.centerContent}>
        {label && (
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            {label}
          </Text>
        )}
        <Text style={[styles.percentage, { color: colors.foreground }]}>
          {Math.round(percentage)}%
        </Text>
        {timeRemaining && (
          <Text style={[styles.timeRemaining, { color: colors.mutedForeground }]}>
            {timeRemaining}
          </Text>
        )}
      </View>

      {/* Milestone Markers */}
      {filteredMilestones.map((milestone) => {
        const milestonePercentage = (milestone.timeHours * 3600) / goalDurationSeconds;
        const angleDeg = milestonePercentage * 360 - 90;
        const angleRad = angleDeg * (Math.PI / 180);

        // Calculate icon position
        const iconCenterX = size / 2 + radius * Math.cos(angleRad);
        const iconCenterY = size / 2 + radius * Math.sin(angleRad);
        
        const buttonSize = 32;
        const iconSize = 16;

        return (
          <Popover key={milestone.id}>
            <PopoverTrigger asChild>
              <TouchableOpacity
                style={[
                  styles.milestoneButton,
                  {
                    left: iconCenterX - buttonSize / 2,
                    top: iconCenterY - buttonSize / 2,
                    width: buttonSize,
                    height: buttonSize,
                    backgroundColor: colors.background + '80', // Semi-transparent
                    borderColor: colors.border,
                  }
                ]}
                activeOpacity={0.7}
                accessibilityLabel={`Milestone: ${milestone.name}`}
              >
                <IconSymbol
                  name={milestone.iconName as any}
                  size={iconSize}
                  color={colors.accent}
                />
              </TouchableOpacity>
            </PopoverTrigger>
            <PopoverContent>
              <View style={styles.popoverContent}>
                <Text style={[styles.milestoneTitle, { color: colors.popoverForeground }]}>
                  {milestone.name}
                </Text>
                <Text style={[styles.milestoneDescription, { color: colors.mutedForeground }]}>
                  {milestone.description}
                </Text>
              </View>
            </PopoverContent>
          </Popover>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  percentage: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timeRemaining: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  milestoneButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popoverContent: {
    gap: 8,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  milestoneDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});