import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font, spacing } from '@/theme';

interface FormHeaderProps {
  title: string;
  leftLabel: string;
  onLeft: () => void;
  rightLabel?: string;
  onRight?: () => void;
  rightDisabled?: boolean;
}

/** Header used by modal forms: [Cancel] Title [Save] */
export function FormHeader({ title, leftLabel, onLeft, rightLabel, onRight, rightDisabled }: FormHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.row, { paddingTop: insets.top + spacing.sm }]}>
      <Pressable onPress={onLeft} hitSlop={8} style={styles.side} accessibilityRole="button" accessibilityLabel={leftLabel}>
        <Text style={styles.cancel}>{leftLabel}</Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.side, styles.right]}>
        {rightLabel && onRight ? (
          <Pressable onPress={onRight} hitSlop={8} disabled={rightDisabled} accessibilityRole="button" accessibilityLabel={rightLabel} accessibilityState={{ disabled: rightDisabled }}>
            <Text style={[styles.save, rightDisabled && styles.saveDisabled]}>{rightLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  side: {
    width: 72,
  },
  right: {
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    ...font.bodyStrong,
    color: colors.ink,
  },
  cancel: {
    ...font.body,
    color: colors.muted,
  },
  save: {
    ...font.bodyStrong,
    color: colors.ink,
  },
  saveDisabled: {
    color: colors.faint,
  },
});
