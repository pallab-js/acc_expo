import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors, font, radius, spacing } from '@/theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'receipt-outline', title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.root} accessible={true} accessibilityLabel={`${title}. ${message}`}>
      <View style={styles.iconWrap} accessibilityElementsHidden={true}>
        <Ionicons name={icon} size={28} color={colors.muted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...font.section,
    color: colors.ink,
  },
  message: {
    ...font.caption,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 260,
  },
  action: {
    marginTop: spacing.md,
  },
});
