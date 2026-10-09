import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

import { formatMoney } from '@/lib/money';
import { colors, tabular } from '@/theme';

interface AmountTextProps {
  /** minor units */
  value: number;
  type?: 'income' | 'expense' | 'neutral';
  signed?: boolean;
  currency?: string;
  style?: TextStyle | TextStyle[];
}

export function AmountText({ value, type = 'neutral', signed = false, currency = 'INR', style }: AmountTextProps) {
  const body = formatMoney(Math.abs(value), currency);
  const sign = signed ? (type === 'income' ? '+' : type === 'expense' ? '-' : '') : '';
  const color =
    type === 'income' ? colors.income : type === 'expense' ? colors.expense : colors.ink;
  return <Text style={[styles.text, tabular, { color }, style]}>{`${sign}${body}`}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
});
