import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font, spacing } from '@/theme';

interface ScreenProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: React.ComponentProps<typeof ScrollView>['contentContainerStyle'];
  fab?: React.ReactNode;
}

/** Shared screen chrome: safe-area aware fixed header + scrollable body. */
export function Screen({ title, subtitle, right, children, scroll = true, contentStyle, fab }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={styles.headerRight}>{right}</View> : null}
      </View>

      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.flex, contentStyle]}>{children}</View>
      )}

      {fab}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...font.title,
    color: colors.ink,
  },
  subtitle: {
    ...font.caption,
    color: colors.muted,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
    gap: spacing.lg,
  },
  flex: {
    flex: 1,
  },
});
