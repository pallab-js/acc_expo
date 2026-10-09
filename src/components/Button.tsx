import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, font, radius, spacing } from '@/theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
  accessibilityLabel?: string;
}

const background: Record<Variant, string> = {
  primary: colors.primary,
  secondary: colors.hairline,
  danger: colors.expenseSoft,
  ghost: 'transparent',
};

const foreground: Record<Variant, string> = {
  primary: colors.white,
  secondary: colors.ink,
  danger: colors.expense,
  ghost: colors.ink,
};

export function Button({ label, onPress, variant = 'primary', disabled, loading, style, accessibilityLabel }: ButtonProps) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background[variant] },
        inactive && styles.disabled,
        pressed && !inactive && styles.pressed,
        style,
      ]}>
      {loading ? <ActivityIndicator color={foreground[variant]} size="small" /> : null}
      <Text style={[styles.label, { color: foreground[variant] }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
  },
  label: {
    ...font.bodyStrong,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.85,
  },
});
