import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { getCategory } from '@/lib/categories';
import { colors } from '@/theme';

interface CategoryIconProps {
  categoryId: string;
  size?: number;
}

function withAlpha(hex: string, alpha: string): string {
  return `${hex}${alpha}`;
}

export function CategoryIcon({ categoryId, size = 40 }: CategoryIconProps) {
  const category = getCategory(categoryId);
  const iconSize = Math.round(size * 0.5);
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: withAlpha(category.color, '1A'),
        },
      ]}
      accessibilityElementsHidden={true}
      importantForAccessibility="no"
    >
      <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={iconSize} color={category.color} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
});
