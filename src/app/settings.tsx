import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { FormHeader } from '@/components/FormHeader';
import { shareTransactionsCsv } from '@/lib/exportCsv';
import { useStore } from '@/store/useStore';
import { colors, font, radius, spacing } from '@/theme';

interface RowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  danger?: boolean;
  onPress?: () => void;
}

function Row({ icon, title, subtitle, danger, onPress }: RowProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Ionicons name={icon} size={17} color={danger ? colors.expense : colors.ink} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, danger && styles.dangerText]}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={16} color={colors.faint} /> : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const transactions = useStore((state) => state.transactions);
  const settings = useStore((state) => state.settings);
  const budgets = useStore((state) => state.budgets);
  const recurring = useStore((state) => state.recurring);
  const resetToSample = useStore((state) => state.resetToSample);
  const deleteAllData = useStore((state) => state.deleteAllData);
  const [busy, setBusy] = useState(false);

  const onExport = () => {
    if (!transactions.length) {
      Alert.alert('Nothing to export', 'There are no transactions yet.');
      return;
    }
    shareTransactionsCsv(transactions, settings.currency).catch((error: unknown) => {
      Alert.alert('Export failed', error instanceof Error ? error.message : 'Unknown error.');
    });
  };

  const onReset = () => {
    Alert.alert('Reset to sample data?', 'Your current data will be replaced with the demo dataset.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          setBusy(true);
          resetToSample()
            .catch(() => {})
            .finally(() => setBusy(false));
        },
      },
    ]);
  };

  const onDeleteAll = () => {
    Alert.alert('Delete all data?', 'Transactions, budgets and rules will be permanently removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete everything',
        style: 'destructive',
        onPress: () => {
          setBusy(true);
          deleteAllData()
            .catch(() => {})
            .finally(() => setBusy(false));
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <FormHeader title="Settings" leftLabel="Close" onLeft={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        scrollEnabled={!busy}
        pointerEvents={busy ? 'none' : 'auto'}>
        <View>
          <Text style={styles.sectionLabel}>Preferences</Text>
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="cash-outline" size={17} color={colors.ink} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Currency</Text>
                <Text style={styles.rowSubtitle}>Indian Rupee (₹) — {settings.currency}</Text>
              </View>
              <Text style={styles.badge}>Default</Text>
            </View>
          </Card>
        </View>

        <View>
          <Text style={styles.sectionLabel}>Data</Text>
          <Card style={styles.card}>
            <Row icon="download-outline" title="Export transactions" subtitle={`${transactions.length} entries · CSV`} onPress={onExport} />
            <View style={styles.divider} />
            <Row icon="refresh-outline" title="Reset to sample data" subtitle="Replace everything with the demo dataset" onPress={onReset} />
            <View style={styles.divider} />
            <Row icon="trash-outline" title="Delete all data" subtitle="Start from a blank ledger" danger onPress={onDeleteAll} />
          </Card>
        </View>

        <View>
          <Text style={styles.sectionLabel}>About</Text>
          <Card style={styles.card}>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{transactions.length}</Text>
                <Text style={styles.statLabel}>Transactions</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{budgets.length}</Text>
                <Text style={styles.statLabel}>Budgets</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{recurring.length}</Text>
                <Text style={styles.statLabel}>Rules</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <Text style={styles.about}>
              Ledger 1.0 · Local-first accounting. All data stays on this device, stored with
              AsyncStorage. No account, no internet required.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  sectionLabel: {
    ...font.tiny,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  pressed: {
    opacity: 0.6,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconDanger: {
    backgroundColor: colors.expenseSoft,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    ...font.bodyStrong,
    color: colors.ink,
  },
  rowSubtitle: {
    ...font.caption,
    color: colors.muted,
  },
  dangerText: {
    color: colors.expense,
  },
  badge: {
    ...font.tiny,
    color: colors.faint,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
    marginHorizontal: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
  },
  statLabel: {
    ...font.tiny,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  about: {
    ...font.caption,
    color: colors.muted,
    padding: spacing.md,
    lineHeight: 18,
  },
});
