import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

interface ProgressBarProps {
  /** 0..1 (values above 1 render full with the over color) */
  progress: number;
  color?: string;
  height?: number;
  accessibilityLabel?: string;
  accessibilityValue?: { min: number; max: number; now: number };
}

export function ProgressBar({
  progress,
  color = colors.ink,
  height = 8,
  accessibilityLabel = 'Progress',
  accessibilityValue,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const percent = Math.round(clamped * 100);
  return (
    <View
      style={[styles.track, { height, borderRadius: height / 2 }]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={accessibilityValue ?? { min: 0, max: 100, now: percent }}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clamped * 100}%`,
            backgroundColor: color,
            height,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.hairline,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: radius.pill,
  },
});
