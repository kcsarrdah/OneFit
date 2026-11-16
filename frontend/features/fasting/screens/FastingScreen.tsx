import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionButton } from '@/components/ui/ActionButton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { Colors, GlassEffectConfig } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useNavigation } from '@/contexts/NavigationContext';
import { FastComplete } from '../components/FastComplete';
import { FastRing } from '../components/FastRing';
import { FASTING_SCHEDULES } from '../constants';
import { useFastCompletion } from '../hooks/useFastCompletion';
import { useFastingTimer } from '../hooks/useFastingTimer';
import { expectedEnd, formatDayTime, formatFastLength, formatHoursClock } from '../lib/format';

/**
 * @file FastingScreen.tsx
 * @description The fasting timer: one big number for the time left in the
 * ring, when the fast started and when it ends, and one action at the thumb
 * (Start fast, then End fast). Ending early asks first. A finished fast takes
 * over the screen in the accent (FastComplete) to save or discard it.
 */

const SIDEBAR_INSET = GlassEffectConfig.dimensions.vertical.contentInset;

export function FastingScreen() {
  const colors = Colors.dark;
  const insets = useSafeAreaInsets();
  const { setFocusMode } = useNavigation();
  const [confirmingEnd, setConfirmingEnd] = useState(false);

  // Always 16:8 for now; the schedule will come from user settings.
  const schedule = FASTING_SCHEDULES[0];
  const goalDurationSeconds = schedule.durationHours * 3600;

  const completion = useFastCompletion();
  const { isActive, remainingSeconds, progressPercentage, startTime, startFast, stopFast } = useFastingTimer({
    goalDurationSeconds,
    onComplete: completion.openModal,
  });

  const done = completion.showModal && completion.completedFast !== null;

  // The completion takeover hides the header, sidebar and tab bar.
  useEffect(() => {
    setFocusMode(done);
    return () => setFocusMode(false);
  }, [done, setFocusMode]);

  const endFast = () => (remainingSeconds > 0 ? setConfirmingEnd(true) : stopFast());

  const time = (label: string, value: string) => (
    <View style={styles.time}>
      <Text style={[styles.timeLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.timeValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { paddingLeft: SIDEBAR_INSET }]}>
        <ScreenTitle>Fasting</ScreenTitle>
        <Text style={[styles.schedule, { color: colors.mutedForeground }]}>
          {schedule.name} · {schedule.durationHours} hours fasting
        </Text>

        <View style={styles.ring}>
          <FastRing
            progress={progressPercentage}
            value={formatHoursClock(isActive ? remainingSeconds : goalDurationSeconds)}
            caption={isActive ? `left · ${Math.floor(progressPercentage)}%` : 'hours to go'}
          />
        </View>

        <View style={styles.times}>
          {time(isActive ? 'Started' : 'Start', formatDayTime(startTime))}
          {time('Ends', formatDayTime(expectedEnd(startTime ?? Date.now(), goalDurationSeconds)))}
        </View>
      </View>

      <ActionButton
        label={isActive ? 'End fast' : 'Start fast'}
        onPress={isActive ? endFast : startFast}
        style={[styles.action, { left: SIDEBAR_INSET, bottom: insets.bottom + 84 }]}
      />

      <ConfirmDialog
        visible={confirmingEnd}
        title="End your fast?"
        description={`${formatFastLength(remainingSeconds)} to go of ${schedule.durationHours}h. It's saved as an early finish.`}
        confirmLabel="End fast"
        onConfirm={() => {
          setConfirmingEnd(false);
          stopFast();
        }}
        onCancel={() => setConfirmingEnd(false)}
      />

      {done && completion.completedFast && (
        <FastComplete
          fast={completion.completedFast}
          notes={completion.notes}
          onNotes={completion.setNotes}
          saving={completion.isLoading}
          onSave={() => completion.saveFast()}
          onDiscard={completion.discardFast}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingTop: 20, paddingRight: 20 },
  schedule: { marginTop: 6, fontSize: 15 },
  ring: { alignItems: 'center', marginTop: 28 },
  times: { flexDirection: 'row', gap: 16, marginTop: 32 },
  time: { flex: 1 },
  timeLabel: { fontSize: 13 },
  timeValue: { marginTop: 2, fontFamily: Fonts.display, fontSize: 22, letterSpacing: 0.4 },
  action: { position: 'absolute', right: 20 },
});
