// app/fasting.tsx
import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CircularProgress } from '@/components/CircularProgress';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function FastTrackScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const borderColor = useThemeColor({}, 'border');
  const mutedForeground = useThemeColor({}, 'mutedForeground');
  const textColor = useThemeColor({}, 'foreground');
  const cardBgColor = useThemeColor({}, 'card');
  const cardTextColor = useThemeColor({}, 'cardForeground');

  // Static data
  const currentSchedule = {
    name: "16:8 Intermittent Fasting",
    durationHours: 16
  };

  const progressPercentage = 45; // Static progress
  const timeRemaining = "08:45:30"; // Static time remaining

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>FastTrack</Text>
        <View style={styles.headerButtons}>
          <Button
            variant="ghost"
            size="icon"
            onPress={() => {}}
          >
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={textColor} />
          </Button>
        </View>
      </View>

      <Card style={[styles.mainCard, { backgroundColor: cardBgColor, borderColor }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: cardTextColor }]}>Current Fast</Text>
          <Text style={[styles.cardDescription, { color: mutedForeground }]}>
            {currentSchedule.name} - {currentSchedule.durationHours} hours
          </Text>
        </View>

        <View style={styles.cardContent}>
          <CircularProgress
            percentage={progressPercentage}
            size={240}
            strokeWidth={20}
            label="Time Elapsed"
            timeRemaining={timeRemaining}
            milestones={[]}
            goalDurationSeconds={currentSchedule.durationHours * 3600}
          />

          <View style={styles.timeInfo}>
            <View style={styles.timeInfoColumn}>
              <Text style={[styles.timeInfoLabel, { color: mutedForeground }]}>Start Time</Text>
              <Text style={[styles.timeInfoValue, { color: textColor }]}>
                Mar 15, 8:00 AM
              </Text>
            </View>
            <View style={styles.timeInfoColumn}>
              <Text style={[styles.timeInfoLabel, { color: mutedForeground }]}>Expected End</Text>
              <Text style={[styles.timeInfoValue, { color: textColor }]}>
                Mar 16, 12:00 AM
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Button
            onPress={() => {}}
            style={[styles.actionButton, { backgroundColor: colors.accent }]}
          >
            <IconSymbol
              name="heart.fill"
              size={24}
              color={colors.accentForeground}
            />
            <Text style={[styles.buttonText, { color: colors.accentForeground }]}>
              Start
            </Text>
          </Button>
          <Button
            onPress={() => {}}
            variant="outline"
            style={styles.actionButton}
          >
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={textColor} />
            <Text style={[styles.buttonText, { color: textColor }]}>Reset</Text>
          </Button>
        </View>
      </Card>

      <Card style={[styles.historyCard, { backgroundColor: cardBgColor, borderColor }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: cardTextColor }]}>Recent Fasts</Text>
        </View>
        <View style={styles.cardContent}>
          <View style={[styles.historyItem, { borderBottomColor: borderColor }]}>
            <Text style={[styles.historyText, { color: textColor }]}>
              Started: Mar 14, 8:00 AM
            </Text>
            <Text style={[styles.historyText, { color: textColor }]}>
              Ended: Mar 15, 12:00 AM
            </Text>
            <Text style={[styles.historyText, { color: textColor }]}>
              Duration: 16:00:00
            </Text>
            <Text style={[styles.historyNotes, { color: mutedForeground }]}>
              Notes: Felt great, good energy levels
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
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
    width: '100%',
    marginTop: 16,
  },
  timeInfoColumn: {
    flex: 1,
  },
  timeInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeInfoValue: {
    fontSize: 14,
  },
  historyCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    borderWidth: 1,
  },
  historyItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  historyText: {
    fontSize: 14,
  },
  historyNotes: {
    fontSize: 12,
    marginTop: 4,
  },
});