import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionButton } from '@/components/ui/ActionButton';
import { ScreenTitle } from '@/components/ui/ScreenTitle';
import { Colors, GlassEffectConfig } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { ResetIntake } from '../components/ResetIntake';
import { WaterFill } from '../components/WaterFill';
import { useHydration } from '../hooks/useHydration';
import { fillFraction, remaining } from '../lib/hydration';

/**
 * @file WaterScreen.tsx
 * @description The water tracker: today's intake as one big number, what is
 * left of the goal, the screen filling with water as you log, and one action
 * at the thumb (+250 ml). Reset is a quiet text button that asks first.
 */

const SIDEBAR_INSET = GlassEffectConfig.dimensions.vertical.contentInset;

export function WaterScreen() {
  const colors = Colors.dark;
  const insets = useSafeAreaInsets();
  const { dailyGoal, intake, logAmount, isLoaded, logWater, resetWater } = useHydration();

  if (!isLoaded) return <View style={[styles.screen, { backgroundColor: colors.background }]} />;

  const left = remaining(intake, dailyGoal);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { paddingLeft: SIDEBAR_INSET }]}>
        <ScreenTitle>Water</ScreenTitle>
        <Text style={[styles.intake, { color: colors.foreground }]} accessibilityLabel={`${intake} millilitres today`} numberOfLines={1} adjustsFontSizeToFit>
          {intake.toLocaleString()}
          <Text style={[styles.unit, { color: colors.mutedForeground }]}> ML</Text>
        </Text>
        <View style={styles.row}>
          <Text style={[styles.left, { color: colors.mutedForeground }]}>
            {left > 0
              ? `${left.toLocaleString()} ml to go of ${dailyGoal.toLocaleString()}`
              : `Goal reached · ${dailyGoal.toLocaleString()} ml`}
          </Text>
          <ResetIntake intake={intake} onReset={resetWater} />
        </View>
      </View>

      <WaterFill fraction={fillFraction(intake, dailyGoal)} />

      <ActionButton
        label={`+ ${logAmount} ml`}
        accessibilityLabel={`Log ${logAmount} millilitres`}
        onPress={logWater}
        style={[styles.action, { left: SIDEBAR_INSET, bottom: insets.bottom + 84 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingTop: 20, paddingRight: 20, zIndex: 20 },
  intake: {
    marginTop: 22,
    fontFamily: Fonts.displayBold,
    fontSize: 104,
    lineHeight: 112,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  unit: { fontFamily: Fonts.display, fontSize: 28, letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  left: { flex: 1, fontSize: 15 },
  action: { position: 'absolute', right: 20, zIndex: 20 },
});
