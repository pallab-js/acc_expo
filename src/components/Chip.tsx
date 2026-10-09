import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, font, radius, spacing } from '@/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'checkbox' | 'tab';
}

export function Chip({
  label,
  selected = false,
  icon,
  iconColor,
  onPress,
  accessibilityLabel,
  accessibilityRole = 'button',
}: ChipProps) {
  return (
    <Pressable
      onPress={() => {
        if (!onPress) return;
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={[styles.chip, selected && styles.chipSelected]}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ selected }}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={selected ? colors.white : (iconColor ?? colors.muted)}
        />
      ) : null}
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  label: {
    ...font.captionStrong,
    color: colors.inkSecondary,
  },
  labelSelected: {
    color: colors.white,
  },
});
