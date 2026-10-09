import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, font, spacing, tabular } from '@/theme';

export interface DonutSlice {
  key: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  size?: number;
  strokeWidth?: number;
  centerValue?: string;
  centerLabel?: string;
  accessibilityLabel?: string;
}

export function DonutChart({
  slices,
  size = 156,
  strokeWidth = 22,
  centerValue,
  centerLabel,
  accessibilityLabel = 'Spending breakdown by category',
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  let accumulated = 0;
  const segments = slices
    .filter((slice) => slice.value > 0)
    .map((slice) => {
      const fraction = slice.value / total;
      const length = fraction * circumference;
      const offset = circumference - accumulated;
      accumulated += length;
      return { ...slice, length, offset };
    });

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg
        width={size}
        height={size}
        accessibilityElementsHidden={true}
        importantForAccessibility="no"
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.hairline}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {total > 0
          ? segments.map((segment) => (
              <Circle
                key={segment.key}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segment.length} ${circumference - segment.length}`}
                strokeDashoffset={segment.offset}
                strokeLinecap="butt"
                fill="none"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            ))
          : null}
      </Svg>
      <View style={styles.center} pointerEvents="none">
        {centerValue ? <Text style={[styles.value, tabular]}>{centerValue}</Text> : null}
        {centerLabel ? <Text style={styles.label}>{centerLabel}</Text> : null}
      </View>
      <Text accessible={true} accessibilityLabel={accessibilityLabel} style={styles.srOnly}>
        {slices.map((s) => `${s.key}: ${s.value}`).join(', ')}
      </Text>
    </View>
  );
}

export interface LegendItem {
  key: string;
  label: string;
  color: string;
  valueText: string;
  percent?: number;
}

export function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <View style={styles.legend} accessible={true} accessibilityLabel="Category breakdown">
      {items.map((item) => (
        <View key={item.key} style={styles.legendRow} accessible={true} accessibilityLabel={`${item.label}: ${item.valueText}${item.percent !== undefined ? `, ${item.percent}%` : ''}`}>
          <View style={[styles.dot, { backgroundColor: item.color }]} accessibilityElementsHidden={true} />
          <View style={styles.legendTextBlock}>
            <Text style={styles.legendLabel} numberOfLines={1}>
              {item.label}
            </Text>
            <Text style={[styles.legendMeta, tabular]} numberOfLines={1}>
              {item.valueText}
              {item.percent !== undefined ? `  ·  ${item.percent}%` : ''}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  label: {
    ...font.tiny,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  srOnly: {
    position: 'absolute',
    width: 0,
    height: 0,
    overflow: 'hidden',
  },
  legend: {
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  legendLabel: {
    ...font.captionStrong,
    color: colors.ink,
  },
  legendMeta: {
    ...font.tiny,
    color: colors.muted,
  },
});
