import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { FAB } from '@/components/FAB';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { TransactionRow } from '@/components/TransactionRow';
import { groupDatesDescending } from '@/lib/dates';
import { shareTransactionsCsv } from '@/lib/exportCsv';
import { filterTransactions, sortNewestFirst } from '@/lib/selectors';
import { useStore } from '@/store/useStore';
import { colors, font, radius, spacing } from '@/theme';

type TypeFilter = 'all' | 'expense' | 'income';

export default function TransactionsScreen() {
  const transactions = useStore((state) => state.transactions);
  const settings = useStore((state) => state.settings);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<TypeFilter>('all');

  const filtered = useMemo(
    () => sortNewestFirst(filterTransactions(transactions, { query, type })),
    [transactions, query, type],
  );
  const sections = useMemo(() => groupDatesDescending(filtered), [filtered]);

  const onExport = () => {
    if (!transactions.length) {
      Alert.alert('Nothing to export', 'Add a transaction first.');
      return;
    }
    shareTransactionsCsv(transactions, settings.currency).catch((error: unknown) => {
      Alert.alert('Export failed', error instanceof Error ? error.message : 'Unknown error.');
    });
  };

  return (
    <Screen
      title="Activity"
      subtitle={`${filtered.length} of ${transactions.length} transactions`}
      right={<IconButton icon="download-outline" accessibilityLabel="Export CSV" onPress={onExport} />}
      fab={
        <FAB
          label="Add transaction"
          onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: 'new' } })}
        />
      }>
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={colors.faint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search category or note"
          placeholderTextColor={colors.faint}
          style={styles.search}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.filters}>
        <Chip label="All" selected={type === 'all'} onPress={() => setType('all')} />
        <Chip label="Expense" selected={type === 'expense'} onPress={() => setType('expense')} />
        <Chip label="Income" selected={type === 'income'} onPress={() => setType('income')} />
      </View>

      {sections.length ? (
        sections.map((section) => (
          <View key={section.date} style={styles.section}>
            <Text style={styles.sectionLabel}>{section.label}</Text>
            <Card style={styles.sectionCard}>
              {section.items.map((tx, index) => (
                <View key={tx.id}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <TransactionRow
                    transaction={tx}
                    showDate={false}
                    onPress={() =>
                      router.push({ pathname: '/transaction/[id]', params: { id: tx.id } })
                    }
                  />
                </View>
              ))}
            </Card>
          </View>
        ))
      ) : (
        <EmptyState
          icon="search-outline"
          title="No matches"
          message={transactions.length ? 'Try a different search or filter.' : 'Add your first transaction to get started.'}
          actionLabel={transactions.length ? undefined : 'Add transaction'}
          onAction={
            transactions.length
              ? undefined
              : () => router.push({ pathname: '/transaction/[id]', params: { id: 'new' } })
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  search: {
    flex: 1,
    ...font.body,
    color: colors.ink,
    paddingVertical: spacing.sm,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    ...font.captionStrong,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
    marginLeft: spacing.xs,
  },
  sectionCard: {
    paddingVertical: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
  },
});
