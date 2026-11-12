import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { BigNumber } from '@/components/ui/BigNumber';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Stepper } from '@/components/ui/Stepper';
import { SwipeToConfirm } from '@/components/ui/SwipeToConfirm';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import type { Exercise, WeightUnit, WorkoutSet } from '../types';
import {
  formatSets,
  formatWeight,
  nudge,
  relativeDay,
  startingSet,
  weightStep,
  type LastPerformance,
} from '../lib/setLogging';

/**
 * @file SetLogger.tsx
 * @description Logs one exercise's sets, Robinhood style. Two huge numbers
 * start from this exercise's own last set; steppers nudge them; the accent
 * sheet at the bottom is swiped up to log. The sheet fills the screen and the
 * rest screen carries on in that colour, with the countdown readable from
 * across the gym. "Set N" lowers the colour back into the bar, numbers kept.
 */

interface SetLoggerProps {
  exercise: Exercise;
  /** Sets already logged for this exercise in the current workout. */
  today: WorkoutSet[];
  last: LastPerformance | null;
  unit: WeightUnit;
  onLog: (weight: number, reps: number) => void;
  onUndo: () => void;
  onBack: () => void;
  restSeconds?: number;
}

type Phase = 'enter' | 'returning' | 'resting';

export function SetLogger({ exercise, today, last, unit, onLog, onUndo, onBack, restSeconds = 120 }: SetLoggerProps) {
  const [numbers, setNumbers] = React.useState(() => startingSet(exercise.equipment, today, last));
  const [phase, setPhase] = React.useState<Phase>('enter');
  const [restStartedAt, setRestStartedAt] = React.useState(0);

  const log = () => {
    onLog(numbers.weight, numbers.reps);
    setRestStartedAt(Date.now());
    setPhase('resting');
  };

  if (phase === 'resting') {
    return (
      <RestScreen
        exerciseName={exercise.name}
        today={today}
        unit={unit}
        startedAt={restStartedAt}
        seconds={restSeconds}
        onNextSet={() => setPhase('returning')}
        onUndo={() => {
          onUndo();
          setPhase('returning');
        }}
        onNextExercise={onBack}
      />
    );
  }

  return (
    <SwipeToConfirm label="Swipe up to log" onConfirm={log} enterFromFull={phase === 'returning'}>
      <EntryScreen
        exercise={exercise}
        today={today}
        last={last}
        unit={unit}
        numbers={numbers}
        setNumbers={setNumbers}
        onBack={onBack}
      />
    </SwipeToConfirm>
  );
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function EntryScreen({
  exercise,
  today,
  last,
  unit,
  numbers,
  setNumbers,
  onBack,
}: {
  exercise: Exercise;
  today: WorkoutSet[];
  last: LastPerformance | null;
  unit: WeightUnit;
  numbers: { weight: number; reps: number };
  setNumbers: React.Dispatch<React.SetStateAction<{ weight: number; reps: number }>>;
  onBack: () => void;
}) {
  const colors = Colors.dark;
  const insets = useSafeAreaInsets();
  const step = weightStep(exercise.equipment, unit);
  const unitCaption = (exercise.equipment === 'Dumbbells' ? `${unit} each` : unit).toUpperCase();

  return (
    <View style={[styles.entry, { paddingTop: insets.top + 4 }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to exercises" style={styles.headerButton} hitSlop={8}>
          <IconSymbol name="chevron.left" size={28} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerText, { color: colors.mutedForeground }]}>Set {today.length + 1}</Text>
        <View style={styles.headerButton} />
      </View>

      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={`${exercise.name}, change exercise`} style={styles.titleWrap}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {exercise.name}
        </Text>
        <IconSymbol name="chevron.down" size={22} color={colors.mutedForeground} />
      </Pressable>
      <Text style={[styles.lastTime, { color: colors.mutedForeground }]} numberOfLines={1}>
        {today.length
          ? `Today: ${formatSets(today)}`
          : last
            ? `${capitalise(relativeDay(last.date))}: ${formatSets(last.sets)}`
            : 'First time logging this one'}
      </Text>

      <View style={styles.numbers}>
        <BigNumber
          name="Weight"
          value={numbers.weight}
          caption={unitCaption}
          max={unit === 'kg' ? 500 : 1100}
          decimal
          format={formatWeight}
          onChange={(weight) => setNumbers((n) => ({ ...n, weight }))}
        />
        <Text style={[styles.times, { color: colors.tabIconDefault }]}>×</Text>
        <BigNumber
          name="Reps"
          value={numbers.reps}
          caption="REPS"
          max={200}
          onChange={(reps) => setNumbers((n) => ({ ...n, reps: Math.max(1, Math.round(reps)) }))}
        />
      </View>

      <View style={styles.steppers}>
        <Stepper
          name="weight"
          step={`${formatWeight(step)} ${unit}`}
          onDecrement={() => setNumbers((n) => ({ ...n, weight: nudge(n.weight, -step) }))}
          onIncrement={() => setNumbers((n) => ({ ...n, weight: nudge(n.weight, step) }))}
        />
        <Stepper
          name="reps"
          step="1 rep"
          onDecrement={() => setNumbers((n) => ({ ...n, reps: nudge(n.reps, -1, 1, 200) }))}
          onIncrement={() => setNumbers((n) => ({ ...n, reps: nudge(n.reps, 1, 1, 200) }))}
        />
      </View>
    </View>
  );
}

/**
 * The confirmation, in the accent colour the swipe filled the screen with.
 * Ink is near-black for contrast (7.6:1 on the orange).
 */
function RestScreen({
  exerciseName,
  today,
  unit,
  startedAt,
  seconds,
  onNextSet,
  onUndo,
  onNextExercise,
}: {
  exerciseName: string;
  today: WorkoutSet[];
  unit: WeightUnit;
  startedAt: number;
  seconds: number;
  onNextSet: () => void;
  onUndo: () => void;
  onNextExercise: () => void;
}) {
  const colors = Colors.dark;
  const ink = colors.accentForeground;
  const insets = useSafeAreaInsets();
  const [now, setNow] = React.useState(Date.now());
  const remaining = Math.max(0, seconds - Math.floor((now - startedAt) / 1000));
  const logged = today[today.length - 1];

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);
  React.useEffect(() => {
    if (remaining === 0 && Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [remaining]);

  const clock = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;

  return (
    <View style={[styles.rest, { backgroundColor: colors.accent, paddingTop: insets.top + 4, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.header}>
        <Pressable onPress={onNextExercise} accessibilityRole="button" accessibilityLabel="Back to exercises" style={styles.headerButton} hitSlop={8}>
          <IconSymbol name="chevron.left" size={28} color={ink} />
        </Pressable>
        <Text style={[styles.headerText, { color: ink }]}>{exerciseName}</Text>
        <Pressable onPress={onUndo} accessibilityRole="button" accessibilityLabel="Undo this set" style={styles.headerButton} hitSlop={8}>
          <Text style={[styles.undo, { color: ink }]}>Undo</Text>
        </Pressable>
      </View>

      <View style={styles.restBody}>
        <Text style={[styles.loggedTitle, { color: ink }]} accessibilityRole="header">
          Set {today.length} logged
        </Text>
        {logged && (
          <Text style={[styles.loggedSub, { color: ink }]}>
            {formatWeight(logged.weight)} {unit} × {logged.reps}
          </Text>
        )}

        <View
          style={styles.clockBlock}
          accessible
          accessibilityRole="timer"
          accessibilityLabel={remaining ? `Rest, ${clock} left` : 'Rest over'}
        >
          <Text style={[styles.clockLabel, { color: ink }]}>{remaining ? 'Rest' : 'Go'}</Text>
          <Text style={[styles.clock, { color: ink }]}>{clock}</Text>
          <View style={[styles.track, { backgroundColor: 'rgba(11, 9, 8, 0.16)' }]}>
            <View style={[styles.trackFill, { backgroundColor: ink, width: `${(remaining / seconds) * 100}%` }]} />
          </View>
        </View>

        <View style={styles.chips} accessibilityLabel={`Today: ${formatSets(today)}`}>
          {today.map((s) => (
            <View key={s.id} style={[styles.chip, { backgroundColor: 'rgba(11, 9, 8, 0.12)' }]}>
              <Text style={[styles.chipText, { color: ink }]}>
                {formatWeight(s.weight)} × {s.reps}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.restActions}>
        <Button
          variant="outline"
          onPress={onNextExercise}
          containerStyle={styles.restButtonWrap}
          style={[styles.restButton, { backgroundColor: 'transparent', borderColor: ink, borderWidth: 2 }]}
          textStyle={[styles.restButtonText, { color: ink }]}
        >
          Next exercise
        </Button>
        <Button
          onPress={onNextSet}
          containerStyle={styles.restButtonWrap}
          style={[styles.restButton, { backgroundColor: ink }]}
          textStyle={[styles.restButtonText, { color: colors.accent }]}
        >
          {`Set ${today.length + 1}`}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  entry: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: { minWidth: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  headerText: { fontSize: 15, fontWeight: '600' },
  undo: { fontSize: 16, fontWeight: '700' },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
    minHeight: 48,
    paddingHorizontal: 24,
  },
  // Long names ("Incline Bench Press") wrap to two lines rather than truncate.
  title: {
    flexShrink: 1,
    fontFamily: Fonts.display,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: 0.4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  lastTime: { textAlign: 'center', fontSize: 15, marginTop: 2 },
  numbers: {
    marginTop: 44,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
  },
  times: { fontFamily: Fonts.display, fontSize: 40, marginTop: 40 },
  steppers: { flexDirection: 'row', gap: 12, marginTop: 36, paddingHorizontal: 4 },

  rest: { flex: 1, paddingHorizontal: 16 },
  restBody: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 24 },
  loggedTitle: { fontFamily: Fonts.displayBold, fontSize: 40, letterSpacing: 0.4, textTransform: 'uppercase' },
  loggedSub: { marginTop: 2, fontSize: 18, fontWeight: '600', fontVariant: ['tabular-nums'] },
  clockBlock: { alignItems: 'center', marginTop: 48, width: '100%' },
  clockLabel: { fontSize: 13, fontWeight: '800', letterSpacing: 2.4, textTransform: 'uppercase' },
  clock: { fontFamily: Fonts.displayBold, fontSize: 128, lineHeight: 140, fontVariant: ['tabular-nums'] },
  track: { width: '72%', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  trackFill: { height: '100%', borderRadius: 3 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 40 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  chipText: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  restActions: { flexDirection: 'row', gap: 10 },
  restButtonWrap: { flex: 1 },
  restButton: { height: 64, borderRadius: 22 },
  restButtonText: { fontFamily: Fonts.display, fontSize: 18, letterSpacing: 1, textTransform: 'uppercase' },
});
