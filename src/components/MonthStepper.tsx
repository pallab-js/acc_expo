import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, font, radius, spacing } from '@/theme';

interface MonthStepperProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}

export function MonthStepper({ label, onPrev, onNext, nextDisabled = false }: MonthStepperProps) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onPrev}
        hitSlop={10}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Previous month"
      >
        <Ionicons name="chevron-back" size={18} color={colors.ink} />
      </Pressable>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => {
          if (!nextDisabled) onNext();
        }}
        hitSlop={10}
        style={[styles.button, nextDisabled && styles.buttonDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Next month"
        accessibilityState={{ disabled: nextDisabled }}
      >
        <Ionicons name="chevron-forward" size={18} color={nextDisabled ? colors.faint : colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.hairline,
  },
  buttonDisabled: {
    backgroundColor: 'transparent',
  },
  label: {
    ...font.bodyStrong,
    color: colors.ink,
  },
});
