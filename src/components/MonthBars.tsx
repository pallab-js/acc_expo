import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatMoneyCompact } from '@/lib/money';
import { TrendPoint } from '@/lib/selectors';
import { colors, font, spacing, tabular } from '@/theme';

interface MonthBarsProps {
  data: TrendPoint[];
  /** height of the bar area only — labels render below it, never inside */
  height?: number;
}

export function MonthBars({ data, height = 120 }: MonthBarsProps) {
  const max = Math.max(1, ...data.flatMap((point) => [point.income, point.expense]));

  /** bar height as a percentage of the fixed bar area; 0 hides the bar */
  const barPercent = (value: number): number => {
    if (value <= 0) return 0;
    const pct = (value / max) * 100;
    return Math.min(100, Math.max(3, pct));
  };

  const accessibilityLabel = `Monthly trend chart: ${data.map((p) => `${p.label} - Income ${formatMoneyCompact(p.income)}, Expense ${formatMoneyCompact(p.expense)}`).join('; ')}`;

  return (
    <View accessible={true} accessibilityLabel={accessibilityLabel}>
      <View style={styles.legend} accessible={true} accessibilityLabel="Chart legend">
        <View style={styles.legendItem} accessible={true} accessibilityLabel="Income">
          <View style={[styles.dot, { backgroundColor: colors.income }]} accessibilityElementsHidden={true} />
          <Text style={styles.legendText}>Income</Text>
        </View>
        <View style={styles.legendItem} accessible={true} accessibilityLabel="Expense">
          <View style={[styles.dot, { backgroundColor: colors.expense }]} accessibilityElementsHidden={true} />
          <Text style={styles.legendText}>Expense</Text>
        </View>
      </View>

      {/* Bar area: fixed height, children are percentage-capped so nothing overflows */}
      <View style={[styles.chart, { height }]} accessibilityElementsHidden={true}>
        {data.map((point) => (
          <View key={point.monthKey} style={styles.column}>
            <View style={styles.barGroup}>
              <View
                style={[
                  styles.bar,
                  { height: `${barPercent(point.income)}%`, backgroundColor: colors.income },
                ]}
              />
            </View>
            <View style={styles.barGroup}>
              <View
                style={[
                  styles.bar,
                  { height: `${barPercent(point.expense)}%`, backgroundColor: colors.expense },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Label row sits outside the bar area — cannot overlap bars or the axis */}
      <View style={[styles.labels, { gap: spacing.xs }]}>
        {data.map((point) => (
          <Text key={point.monthKey} style={styles.monthLabel} numberOfLines={1}>
            {point.label}
          </Text>
        ))}
      </View>

      <View style={styles.axis}>
        <Text style={styles.axisText}>
          Peak {formatMoneyCompact(max)} · last {data.length} months
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  legendText: {
    ...font.tiny,
    color: colors.muted,
  },
  chart: {
    flexDirection: 'row',
    gap: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  column: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 3,
    height: '100%',
  },
  barGroup: {
    flex: 1,
    maxWidth: 12,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: 3,
  },
  labels: {
    flexDirection: 'row',
    paddingTop: spacing.sm,
  },
  monthLabel: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    ...font.tiny,
    color: colors.faint,
    textTransform: 'uppercase',
  },
  axis: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  axisText: {
    ...font.tiny,
    color: colors.faint,
    ...tabular,
  },
});
