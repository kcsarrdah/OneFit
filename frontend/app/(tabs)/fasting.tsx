import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CircularProgress } from '@/components/CircularProgress';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useFastingTimer } from '@/hooks/useFastingTimer';
import { useFastCompletion } from '@/hooks/useFastCompletion';
import { FASTING_SCHEDULES } from '@/constants/fastingSchedules';
import { formatTime } from '@/constants/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogFooter, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/Dialog';
import { TextInput } from 'react-native';


export default function FastTrackScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const borderColor = useThemeColor({}, 'border');
  const mutedForeground = useThemeColor({}, 'mutedForeground');
  const textColor = useThemeColor({}, 'foreground');
  const cardBgColor = useThemeColor({}, 'card');
  const cardTextColor = useThemeColor({}, 'cardForeground');

  // For now, default to 16:8 schedule - later this will come from user settings
  const currentSchedule = FASTING_SCHEDULES[0]; // 16:8
  const goalDurationSeconds = currentSchedule.durationHours * 3600;


  // Initialize timer hook
  const {
    isActive,
    elapsedSeconds,
    remainingSeconds,
    progressPercentage,
    startTime,
    startFast,
    stopFast,
    resetTimer
  } = useFastingTimer({
    goalDurationSeconds,
    onComplete: (fastData) => {
      openModal(fastData);
    }
  });

  const { 
    openModal,
    showModal,
    completedFast,
    notes,
    isLoading,
    closeModal,
    saveFast,
    discardFast,
    setNotes
  } = useFastCompletion();


    // Helper to format duration for modal display
    const formatDurationForModal = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };


  // Helper functions for display
  const formatStartTime = (timestamp: number | null) => {
    if (!timestamp) return "Not started";
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatExpectedEnd = (startTimestamp: number | null, durationSeconds: number) => {
    if (!startTimestamp) return "Not started";
    const endTime = new Date(startTimestamp + durationSeconds * 1000);
    return endTime.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  };

  const getMainButtonContent = () => {
    if (!isActive) {
      return {
        icon: "play.fill" as const,
        text: "Start Fast",
        onPress: startFast,
        style: { backgroundColor: colors.accent }
      };
    } else {
      return {
        icon: "stop.fill" as const,
        text: "Complete Fast",
        onPress: stopFast,
        style: { backgroundColor: colors.destructive }
      };
    }
  };

  const mainButton = getMainButtonContent();

  return (
    <>
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>FastTrack</Text>
      </View>

      <Card style={[styles.mainCard, { backgroundColor: cardBgColor, borderColor }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: cardTextColor }]}>
            {isActive ? "Active Fast" : "Current Fast"}
          </Text>
          <Text style={[styles.cardDescription, { color: mutedForeground }]}>
            {currentSchedule.name} - {currentSchedule.durationHours} hours
          </Text>
        </View>

        <View style={styles.cardContent}>
          <CircularProgress
            percentage={progressPercentage}
            size={240}
            strokeWidth={20}
            label={isActive ? "Time Elapsed" : "Ready to Start"}
            timeRemaining={isActive ? formatTime(remainingSeconds) : formatTime(goalDurationSeconds)}
            milestones={[]} // TODO: Add milestones from constants
            goalDurationSeconds={goalDurationSeconds}
          />

<View style={styles.timeInfo}>
            <View style={styles.timeInfoColumn}>
              <Text style={[styles.timeInfoLabel, { color: mutedForeground }]}>Start Time</Text>
              <Text style={[styles.timeInfoValue, { color: textColor }]}>
                {formatStartTime(startTime)}
              </Text>
            </View>
            <View style={styles.timeInfoColumn}>
              <Text style={[styles.timeInfoLabel, { color: mutedForeground }]}>Expected End</Text>
              <Text style={[styles.timeInfoValue, { color: textColor }]}>
                {formatExpectedEnd(startTime, goalDurationSeconds)}
              </Text>
            </View>
          </View>

          {isActive && (
            <View style={styles.progressInfo}>
              <Text style={[styles.progressText, { color: textColor }]}>
                {formatTime(elapsedSeconds)} elapsed • {Math.round(progressPercentage)}% complete
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Button
            onPress={mainButton.onPress}
            style={[styles.actionButton, mainButton.style]}
          >
            <IconSymbol
              name={mainButton.icon}
              size={24}
              color={colors.accentForeground}
            />
            <Text style={[styles.buttonText, { color: colors.accentForeground }]}>
              {mainButton.text}
            </Text>
          </Button>
          <Button
            onPress={resetTimer}
            variant="outline"
            style={styles.actionButton}
            disabled={isActive} // Don't allow reset during active fast
          >
            <IconSymbol name="arrow.counterclockwise" size={24} color={textColor} />
            <Text style={[styles.buttonText, { color: textColor }]}>Reset</Text>
          </Button>
        </View>
      </Card>

    </ScrollView>
    <Dialog visible={showModal} onDismiss={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fast Complete!</DialogTitle>
            <DialogDescription>
              {completedFast && (
                <>
                  Duration: {formatDurationForModal(completedFast.actualDurationSeconds)}
                  {completedFast.actualDurationSeconds >= completedFast.goalDurationSeconds 
                    ? " 🎉 Goal achieved!" 
                    : " (Early completion)"
                  }
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <View style={styles.modalContent}>
            <Text style={[styles.modalLabel, { color: textColor }]}>
              Notes (optional):
            </Text>
            <TextInput
              style={[styles.modalInput, { 
                color: textColor,
                borderColor: borderColor,
                backgroundColor: cardBgColor 
              }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="How did your fast go?"
              placeholderTextColor={mutedForeground}
              multiline
              numberOfLines={3}
            />
          </View>
          <View style={styles.modalButtonContainer}>
            <Button
              variant="outline"
              onPress={discardFast}
              style={styles.modalButton}
              disabled={isLoading}
            >
              <Text style={{ color: textColor }}>Discard</Text>
            </Button>
            <Button
              onPress={() => saveFast()}
              style={[styles.modalButton, { backgroundColor: colors.accent }]}
              disabled={isLoading}
            >
              <Text style={{ color: colors.accentForeground }}>
                {isLoading ? 'Saving...' : 'Save Fast'}
              </Text>
            </Button>
          </View>
        </DialogContent>
      </Dialog>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  mainCard: {
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardHeader: {
    padding: 16,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    padding: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align to top
    width: '100%',
    marginTop: 16,
    paddingHorizontal: 8, // Add some padding from edges
  },
  timeInfoColumn: {
    flex: 1,
    alignItems: 'center', // Center text within each column
  },
  timeInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  timeInfoValue: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  progressInfo: {
    marginTop: 12,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },

  modalContent: {
    marginVertical: 16,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
  },
  modalButton: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

});