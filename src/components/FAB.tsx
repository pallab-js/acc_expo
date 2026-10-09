import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors, radius, shadow } from '@/theme';

interface FABProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
}

export function FAB({ onPress, icon = 'add', label = 'Add' }: FABProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}>
      <Ionicons name={icon} size={26} color={colors.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
});
