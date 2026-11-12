import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { BigNumber } from '@/components/ui/BigNumber';
import { Button } from '@/components/ui/Button';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Stepper } from '@/components/ui/Stepper';
import { SwipeToConfirm } from '@/components/ui/SwipeToConfirm';
import { Colors } from '@/constants/Colors';
import type { Exercise, WorkoutSet } from '@/constants/workoutData';
import {
  formatSets,
  formatWeight,
  nudge,
  relativeDay,
  startingSet,
  weightStep,
  type LastPerformance,
  type WeightUnit,
} from '@/constants/setLogging';

/**
 * @file SetLogger.tsx
 * @description Logs one exercise's sets, Robinhood style: two huge numbers
 * that start from this exercise's own last set, steppers to nudge them, and a
 * bar you swipe up to log. After a swipe the rest timer runs on its own and
 * the numbers stay put, so the same set again is just another swipe.
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

export function SetLogger({ exercise, today, last, unit, onLog, onUndo, onBack, restSeconds = 120 }: SetLoggerProps) {
  const colors = Colors.dark;
  const insets = useSafeAreaInsets();
  const [numbers, setNumbers] = React.useState(() => startingSet(exercise.equipment, today, last));
  const [restStartedAt, setRestStartedAt] = React.useState<number | null>(null);
  const step = weightStep(exercise.equipment, unit);
  const setNumber = today.length + 1;
  const unitCaption = (exercise.equipment === 'Dumbbells' ? `${unit} each` : unit).toUpperCase();

  const log = () => {
    onLog(numbers.weight, numbers.reps);
    setRestStartedAt(Date.now());
  };

  const header = (
    <View style={styles.header}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to exercises" style={styles.headerButton}>
        <IconSymbol name="chevron.left" size={26} color={colors.foreground} />
      </Pressable>
      <Text style={[styles.headerText, { color: colors.mutedForeground }]}>
        {restStartedAt ? exercise.name : `Set ${setNumber}`}
      </Text>
      {restStartedAt ? (
        <Pressable
          onPress={() => {
            onUndo();
            setRestStartedAt(null);
          }}
          accessibilityRole="button"
          style={styles.headerButton}
        >
          <Text style={[styles.undo, { color: colors.mutedForeground }]}>Undo</Text>
        </Pressable>
      ) : (
        <View style={styles.headerButton} />
      )}
    </View>
  );

  if (restStartedAt) {
    const logged = today[today.length - 1];
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, paddingBottom: insets.bottom + 96 }]}>
        {header}
        <View style={styles.restTop}>
          <View style={[styles.check, { backgroundColor: colors.accent }]}>
            <IconSymbol name="checkmark" size={32} color={colors.accentForeground} />
          </View>
          <Text style={[styles.loggedTitle, { color: colors.foreground }]} accessibilityRole="header">
            Set {today.length} logged
          </Text>
          {logged && (
            <Text style={[styles.loggedSub, { color: colors.mutedForeground }]}>
              {formatWeight(logged.weight)} {unit} × {logged.reps}
            </Text>
          )}
        </View>
        <RestTimer startedAt={restStartedAt} seconds={restSeconds} />
        <SetChips sets={today} highlightLast />
        <View style={{ flex: 1 }} />
        <View style={styles.restActions}>
          <Button variant="secondary" size="lg" onPress={onBack} containerStyle={styles.restButtonWrap} style={styles.restButton}>
            Next exercise
          </Button>
          <Button
            variant="default"
            size="lg"
            onPress={() => setRestStartedAt(null)}
            containerStyle={styles.restButtonWrap}
            style={[styles.restButton, { backgroundColor: colors.accent }]}
            textStyle={{ color: colors.accentForeground, fontWeight: '700' }}
          >
            {`Set ${setNumber}`}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingBottom: insets.bottom + 96 }]}>
      {header}
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={`${exercise.name}, change exercise`} style={styles.titleWrap}>
        <Text style={[styles.title, { color: colors.foreground }]}>{exercise.name}</Text>
        <IconSymbol name="chevron.down" size={22} color={colors.mutedForeground} />
      </Pressable>
      <Text style={[styles.lastTime, { color: colors.mutedForeground }]}>
        {last ? `${capitalise(relativeDay(last.date))}: ${formatSets(last.sets)}` : 'First time logging this one'}
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

      <SetChips sets={today} next={setNumber} />
      <View style={{ flex: 1 }} />
      <SwipeToConfirm label="Swipe up to log" onConfirm={log} style={styles.swipe} />
    </View>
  );
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Today's sets as small chips, plus a dashed one for the set being entered. */
function SetChips({ sets, next, highlightLast = false }: { sets: WorkoutSet[]; next?: number; highlightLast?: boolean }) {
  const colors = Colors.dark;
  if (!sets.length && !next) return null;
  return (
    <View style={styles.chips} accessibilityLabel={sets.length ? `Today: ${formatSets(sets)}` : undefined}>
      {sets.map((s, i) => (
        <View key={s.id} style={[styles.chip, { backgroundColor: colors.card }]}>
          <Text
            style={[
              styles.chipText,
              { color: highlightLast && i === sets.length - 1 ? colors.accent : colors.foreground },
            ]}
          >
            {formatWeight(s.weight)} × {s.reps}
          </Text>
        </View>
      ))}
      {next !== undefined && (
        <View style={[styles.chip, styles.nextChip, { borderColor: colors.accent }]}>
          <Text style={[styles.chipText, { color: colors.accent }]}>Set {next}</Text>
        </View>
      )}
    </View>
  );
}

/** Counts the rest down from the moment the set was logged; buzzes at zero. */
function RestTimer({ startedAt, seconds }: { startedAt: number; seconds: number }) {
  const colors = Colors.dark;
  const [now, setNow] = React.useState(Date.now());
  const remaining = Math.max(0, seconds - Math.floor((now - startedAt) / 1000));

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);
  React.useEffect(() => {
    if (remaining === 0 && Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [remaining]);

  const size = 200;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = remaining / seconds;
  const label = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;

  return (
    <View style={styles.timer} accessibilityRole="timer" accessibilityLabel={remaining ? `Rest, ${label} left` : 'Rest over'}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.secondary} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={remaining ? colors.foreground : colors.accent}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.timerCenter}>
        <Text style={[styles.timerLabel, { color: colors.mutedForeground }]}>{remaining ? 'REST' : 'GO'}</Text>
        <Text style={[styles.timerValue, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.timerOf, { color: colors.mutedForeground }]}>of {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  headerButton: { minWidth: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  headerText: { fontSize: 14, fontWeight: '500' },
  undo: { fontSize: 15, fontWeight: '600' },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 4,
    minHeight: 44,
  },
  title: { fontSize: 26, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  lastTime: { textAlign: 'center', fontSize: 14, marginTop: 2 },
  numbers: {
    marginTop: 36,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 10,
  },
  times: { fontSize: 40, fontWeight: '600', marginTop: 34 },
  steppers: { flexDirection: 'row', gap: 12, marginTop: 28, paddingHorizontal: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 28 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  nextChip: { borderWidth: 1, borderStyle: 'dashed' },
  chipText: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  swipe: { marginBottom: 8 },
  restTop: { alignItems: 'center', marginTop: 24 },
  check: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  loggedTitle: { marginTop: 16, fontSize: 28, fontWeight: '800', textTransform: 'uppercase' },
  loggedSub: { marginTop: 4, fontSize: 15 },
  timer: { alignSelf: 'center', marginTop: 32, width: 200, height: 200 },
  timerCenter: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  timerLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  timerValue: { fontSize: 54, fontWeight: '800', fontVariant: ['tabular-nums'] },
  timerOf: { fontSize: 12 },
  restActions: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  restButtonWrap: { flex: 1 },
  restButton: { height: 60, borderRadius: 22 },
});
