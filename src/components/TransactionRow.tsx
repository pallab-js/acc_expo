import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AmountText } from '@/components/AmountText';
import { CategoryIcon } from '@/components/CategoryIcon';
import { formatDayLabel } from '@/lib/dates';
import { getCategory } from '@/lib/categories';
import { Transaction } from '@/types';
import { colors, font, spacing, tabular } from '@/theme';

interface TransactionRowProps {
  transaction: Transaction;
  onPress?: () => void;
  showDate?: boolean;
}

export function TransactionRow({ transaction, onPress, showDate = true }: TransactionRowProps) {
  const category = getCategory(transaction.categoryId);
  const subtitle = [transaction.note, showDate ? formatDayLabel(transaction.date) : null]
    .filter(Boolean)
    .join(' · ');

  const accessibilityLabel = `${category.name} · ${transaction.type === 'income' ? 'Income' : 'Expense'} · ${Math.abs(transaction.amount / 100).toFixed(2)}` +
    (transaction.note ? ` · ${transaction.note}` : '') +
    (showDate ? ` · ${formatDayLabel(transaction.date)}` : '');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
    >
      <CategoryIcon categoryId={transaction.categoryId} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {category.name}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <AmountText
        value={transaction.amount}
        type={transaction.type}
        signed
        style={tabular}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  pressed: {
    opacity: 0.6,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...font.bodyStrong,
    color: colors.ink,
  },
  subtitle: {
    ...font.caption,
    color: colors.muted,
    marginTop: 2,
  },
});
