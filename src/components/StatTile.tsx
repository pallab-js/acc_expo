import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, font, radius, spacing, tabular } from '@/theme';

interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  tone?: 'neutral' | 'income' | 'expense';
}

export function StatTile({ label, value, hint, tone = 'neutral' }: StatTileProps) {
  const valueColor =
    tone === 'income' ? colors.income : tone === 'expense' ? colors.expense : colors.ink;
  return (
    <View style={styles.tile} accessible={true} accessibilityLabel={`${label}: ${value}` + (hint ? `, ${hint}` : '')}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.value, tabular, { color: valueColor }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {hint ? (
        <Text style={styles.hint} numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minWidth: 0,
  },
  label: {
    ...font.tiny,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: colors.ink,
  },
  hint: {
    ...font.tiny,
    color: colors.faint,
    marginTop: 2,
  },
});
