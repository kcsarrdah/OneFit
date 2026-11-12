import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

/**
 * @file CenteredMessage.tsx
 * @description A short message in the middle of the screen: loading states,
 * empty states and placeholders. Optional bold title above the body line.
 */

interface CenteredMessageProps {
  title?: string;
  body: string;
  titleColor?: string;
  bodyColor?: string;
}

export function CenteredMessage({ title, body, titleColor, bodyColor }: CenteredMessageProps) {
  return (
    <View style={styles.container}>
      {title ? (
        <ThemedText style={[styles.title, titleColor ? { color: titleColor } : null]}>{title}</ThemedText>
      ) : null}
      <ThemedText style={bodyColor ? { color: bodyColor } : undefined}>{body}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
});
