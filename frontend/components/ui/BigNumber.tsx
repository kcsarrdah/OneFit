import React from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';

/**
 * @file BigNumber.tsx
 * @description A huge, tappable number with a small caption under it: the
 * weight and reps on the set logger. Tap to type an exact value; otherwise
 * it is changed with a Stepper.
 *
 * Usage:
 *   <BigNumber name="Weight" value={80} caption="KG" onChange={setWeight} format={formatWeight} decimal />
 */

interface BigNumberProps {
  value: number;
  caption: string;
  onChange: (value: number) => void;
  /** Allow a decimal point when typing (weights), not for reps. */
  decimal?: boolean;
  format?: (value: number) => string;
  /** Screen reader name, e.g. "Weight". */
  name: string;
  max?: number;
}

export function BigNumber({ value, caption, onChange, decimal = false, format = String, name, max = 999 }: BigNumberProps) {
  const colors = Colors.dark;
  const [draft, setDraft] = React.useState<string | null>(null);

  const shown = format(value);
  // Long values (142.5) shrink so weight and reps always fit side by side.
  const fontSize = shown.length <= 2 ? 116 : shown.length === 3 ? 104 : shown.length === 4 ? 88 : 76;

  const commit = () => {
    if (draft === null) return;
    if (draft.trim() === '') return setDraft(null);
    const parsed = decimal ? parseFloat(draft.replace(',', '.')) : parseInt(draft, 10);
    if (Number.isFinite(parsed)) onChange(Math.min(max, Math.max(0, parsed)));
    setDraft(null);
  };

  return (
    <View style={styles.container}>
      {/* Fixed height, bottom-aligned: captions line up whatever the font size. */}
      <View style={styles.valueBox}>
        {draft === null ? (
          <Pressable
            onPress={() => setDraft('')}
            accessibilityRole="button"
            accessibilityLabel={`${name} ${shown} ${caption.toLowerCase()}`}
            accessibilityHint="Tap to type a value"
          >
            <Text style={[styles.value, { fontSize, lineHeight: fontSize * 1.08, color: colors.foreground }]}>{shown}</Text>
          </Pressable>
        ) : (
          <TextInput
            autoFocus
            value={draft}
            onChangeText={setDraft}
            onBlur={commit}
            onSubmitEditing={commit}
            placeholder={shown}
            placeholderTextColor={colors.tabIconDefault}
            keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
            returnKeyType="done"
            accessibilityLabel={name}
            style={[
              styles.value,
              styles.input,
              // Sized to the digits so it never pushes its neighbour off screen.
              {
                fontSize,
                lineHeight: fontSize * 1.08,
                width: Math.max(2, draft.length || shown.length) * fontSize * 0.5 + 16,
                color: colors.foreground,
                borderColor: colors.accent,
              },
            ]}
          />
        )}
      </View>
      <Text style={[styles.caption, { color: colors.mutedForeground }]}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    minWidth: 120,
  },
  valueBox: {
    height: 128,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  value: {
    fontFamily: Fonts.display,
    fontSize: 116,
    lineHeight: 126,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 2,
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  caption: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
});
