import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { CircularProgress } from '../components/CircularProgress';
import { FastCompleteDialog } from '../components/FastCompleteDialog';
import { FASTING_SCHEDULES } from '../constants';
import { useFastCompletion } from '../hooks/useFastCompletion';
import { useFastingTimer } from '../hooks/useFastingTimer';
import { expectedEnd, formatClock, formatTime } from '../lib/format';

/**
 * @file FastingScreen.tsx
 * @description FastTrack: the current fast's progress ring, start and
 * expected end, and Start / Complete / Reset. Completing opens the
 * "Fast complete" dialog to save or discard it.
 */

export function FastingScreen() {
  const colors = Colors.dark;

  // Always 16:8 for now; the schedule will come from user settings.
  const schedule = FASTING_SCHEDULES[0];
  const goalDurationSeconds = schedule.durationHours * 3600;

  const completion = useFastCompletion();
  const { isActive, elapsedSeconds, remainingSeconds, progressPercentage, startTime, startFast, stopFast, resetTimer } =
    useFastingTimer({ goalDurationSeconds, onComplete: completion.openModal });

  const main = isActive
    ? { icon: 'stop.fill' as const, text: 'Complete Fast', onPress: stopFast, color: colors.destructive }
    : { icon: 'play.fill' as const, text: 'Start Fast', onPress: startFast, color: colors.accent };

  const timeColumn = (label: string, value: string) => (
    <View style={styles.timeInfoColumn}>
      <Text style={[styles.timeInfoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.timeInfoValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>FastTrack</Text>
        </View>

        <Card style={[styles.mainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.cardForeground }]}>
              {isActive ? 'Active Fast' : 'Current Fast'}
            </Text>
            <Text style={[styles.cardDescription, { color: colors.mutedForeground }]}>
              {schedule.name} - {schedule.durationHours} hours
            </Text>
          </View>

          <View style={styles.cardContent}>
            <CircularProgress
              percentage={progressPercentage}
              size={240}
              strokeWidth={20}
              label={isActive ? 'Time Elapsed' : 'Ready to Start'}
              timeRemaining={formatTime(isActive ? remainingSeconds : goalDurationSeconds)}
              goalDurationSeconds={goalDurationSeconds}
            />

            <View style={styles.timeInfo}>
              {timeColumn('Start Time', formatClock(startTime))}
              {timeColumn('Expected End', formatClock(expectedEnd(startTime, goalDurationSeconds)))}
            </View>

            {isActive && (
              <View style={styles.progressInfo}>
                <Text style={[styles.progressText, { color: colors.foreground }]}>
                  {formatTime(elapsedSeconds)} elapsed • {Math.round(progressPercentage)}% complete
                </Text>
              </View>
            )}
          </View>

          <View style={styles.cardFooter}>
            <Button onPress={main.onPress} style={[styles.actionButton, { backgroundColor: main.color }]}>
              <IconSymbol name={main.icon} size={24} color={colors.accentForeground} />
              <Text style={[styles.buttonText, { color: colors.accentForeground }]}>{main.text}</Text>
            </Button>
            {/* Reset is off during an active fast. */}
            <Button onPress={resetTimer} variant="outline" style={styles.actionButton} disabled={isActive}>
              <IconSymbol name="arrow.counterclockwise" size={24} color={colors.foreground} />
              <Text style={[styles.buttonText, { color: colors.foreground }]}>Reset</Text>
            </Button>
          </View>
        </Card>
      </ScrollView>

      <FastCompleteDialog
        visible={completion.showModal}
        fast={completion.completedFast}
        notes={completion.notes}
        onNotes={completion.setNotes}
        saving={completion.isLoading}
        onSave={() => completion.saveFast()}
        onDiscard={completion.discardFast}
        onDismiss={completion.closeModal}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  mainCard: { margin: 16, borderRadius: 16, borderWidth: 1 },
  cardHeader: { padding: 16, alignItems: 'center' },
  cardTitle: { fontSize: 20, fontWeight: 'bold' },
  cardDescription: { fontSize: 14, marginTop: 4 },
  cardContent: { padding: 16, alignItems: 'center' },
  cardFooter: { flexDirection: 'row', justifyContent: 'center', gap: 16, padding: 16 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonText: { fontSize: 16, fontWeight: '500' },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  timeInfoColumn: { flex: 1, alignItems: 'center' },
  timeInfoLabel: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
  timeInfoValue: { fontSize: 14, textAlign: 'center', marginTop: 4 },
  progressInfo: { marginTop: 12, alignItems: 'center' },
  progressText: { fontSize: 14, fontWeight: '500' },
});
