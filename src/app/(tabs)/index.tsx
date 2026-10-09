import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { ChartLegend, DonutChart } from '@/components/DonutChart';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { MonthBars } from '@/components/MonthBars';
import { MonthStepper } from '@/components/MonthStepper';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { StatTile } from '@/components/StatTile';
import { TransactionRow } from '@/components/TransactionRow';
import {
  formatDayLabel,
  monthKeyOfDate,
  monthLabel,
  nextMonthKey,
  prevMonthKey,
  todayISO,
} from '@/lib/dates';
import { formatMoney, formatMoneyCompact } from '@/lib/money';
import {
  allTimeBalance,
  budgetStates,
  categoryBreakdown,
  monthStats,
  recentTransactions,
  trendSeries,
} from '@/lib/selectors';
import { useStore } from '@/store/useStore';
import { colors, font, spacing, tabular } from '@/theme';

const STATUS_COLORS = {
  ok: colors.income,
  warn: colors.warn,
  over: colors.expense,
} as const;

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const hydrated = useStore((state) => state.hydrated);
  const transactions = useStore((state) => state.transactions);
  const budgets = useStore((state) => state.budgets);
  const settings = useStore((state) => state.settings);
  const [monthKey, setMonthKey] = useState(() => monthKeyOfDate(new Date()));

  const stats = useMemo(() => monthStats(transactions, monthKey), [transactions, monthKey]);
  const balance = useMemo(() => allTimeBalance(transactions), [transactions]);
  const breakdown = useMemo(
    () => categoryBreakdown(transactions, monthKey).slice(0, 5),
    [transactions, monthKey],
  );
  const budgetList = useMemo(
    () => budgetStates(budgets, transactions, monthKey).slice(0, 3),
    [budgets, transactions, monthKey],
  );
  const trend = useMemo(() => trendSeries(transactions, monthKey, 6), [transactions, monthKey]);
  const recent = useMemo(() => recentTransactions(transactions, 5), [transactions]);
  const currency = settings.currency;
  const balanceText = formatMoney(balance, currency);
  const balanceFontSize =
    balanceText.length > 17 ? 26 : balanceText.length > 14 ? 32 : balanceText.length > 11 ? 38 : 44;

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  const currentMonthKey = monthKeyOfDate(new Date());
  const donutSlices = breakdown.map((share, index) => ({
    key: share.category.id,
    value: share.amount,
    color: share.category.color || chartFallback(index),
  }));

  return (
    <Screen
      title={greeting()}
      subtitle={`Here's your money at a glance · ${formatDayLabel(todayISO())}`}
      right={<IconButton icon="settings-outline" accessibilityLabel="Settings" onPress={() => router.push('/settings')} />}>
      <MonthStepper
        label={monthLabel(monthKey)}
        onPrev={() => setMonthKey((key) => prevMonthKey(key))}
        onNext={() => setMonthKey((key) => nextMonthKey(key))}
        nextDisabled={monthKey >= currentMonthKey}
      />

      {/* Hero balance card */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <Text style={styles.heroLabel}>Total balance</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{monthLabel(monthKey).split(' ')[0]}</Text>
          </View>
        </View>
        <Text
          style={[styles.heroValue, tabular, { fontSize: balanceFontSize, lineHeight: balanceFontSize + 8 }]}
          numberOfLines={1}>
          {balanceText}
        </Text>
        <Text style={styles.heroNet}>
          {stats.net >= 0 ? '+' : '−'}
          {formatMoney(Math.abs(stats.net), currency)} this month
        </Text>
        <View style={styles.heroDivider} />
        <View style={styles.heroRow}>
          <View style={styles.heroColumn}>
            <Text style={styles.heroColumnLabel}>Income</Text>
            <Text style={[styles.heroColumnValue, tabular, styles.incomeText]}>
              {formatMoney(stats.income, currency)}
            </Text>
          </View>
          <View style={styles.heroColumn}>
            <Text style={styles.heroColumnLabel}>Expenses</Text>
            <Text style={[styles.heroColumnValue, tabular, styles.expenseText]}>
              {formatMoney(stats.expense, currency)}
            </Text>
          </View>
          <View style={styles.heroColumn}>
            <Text style={styles.heroColumnLabel}>Savings</Text>
            <Text style={[styles.heroColumnValue, tabular]}>{stats.savingsRate}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.statRow}>
        <StatTile label="Income" value={formatMoneyCompact(stats.income, currency)} tone="income" />
        <StatTile label="Expenses" value={formatMoneyCompact(stats.expense, currency)} tone="expense" />
        <StatTile label="Entries" value={String(stats.count)} hint={stats.count ? 'this month' : undefined} />
      </View>

      {/* Spending by category */}
      <View style={styles.block}>
        <SectionHeader title="Spending by category" actionLabel="Budgets" onAction={() => router.push('/budgets')} />
        <Card>
          {breakdown.length ? (
            <View style={styles.donutRow}>
              <DonutChart
                size={148}
                strokeWidth={20}
                slices={donutSlices}
                centerValue={formatMoneyCompact(
                  breakdown.reduce((sum, share) => sum + share.amount, 0),
                  currency,
                )}
                centerLabel="Spent"
              />
              <ChartLegend
                items={breakdown.map((share) => ({
                  key: share.category.id,
                  label: share.category.name,
                  color: share.category.color,
                  percent: share.percent,
                  valueText: formatMoneyCompact(share.amount, currency),
                }))}
              />
            </View>
          ) : (
            <EmptyState
              icon="pie-chart-outline"
              title="No expenses yet"
              message={`Add an expense to see the ${monthLabel(monthKey).split(' ')[0]} breakdown.`}
            />
          )}
        </Card>
      </View>

      {/* Budget health */}
      <View style={styles.block}>
        <SectionHeader title="Budget health" actionLabel="See all" onAction={() => router.push('/budgets')} />
        <Card>
          {budgetList.length ? (
            <View style={styles.budgetList}>
              {budgetList.map((state) => (
                <View key={state.budget.id} style={styles.budgetItem}>
                  <View style={styles.budgetHeader}>
                    <Text style={styles.budgetName} numberOfLines={1}>
                      {state.category.name}
                    </Text>
                    <Text style={[styles.budgetAmount, tabular]}>
                      {formatMoneyCompact(state.spent, currency)} / {formatMoneyCompact(state.budget.amount, currency)}
                    </Text>
                  </View>
                  <ProgressBar
                    progress={state.spent / state.budget.amount}
                    color={STATUS_COLORS[state.status]}
                  />
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="wallet-outline"
              title="No budgets set"
              message="Set monthly limits to keep spending in check."
              actionLabel="Create budget"
              onAction={() => router.push('/budgets')}
            />
          )}
        </Card>
      </View>

      {/* Monthly trend */}
      <View style={styles.block}>
        <SectionHeader title="Monthly trend" />
        <Card>
          <MonthBars data={trend} />
        </Card>
      </View>

      {/* Recent activity */}
      <View style={styles.block}>
        <SectionHeader title="Recent activity" actionLabel="See all" onAction={() => router.push('/transactions')} />
        <Card style={styles.recentCard}>
          {recent.length ? (
            recent.map((tx, index) => (
              <View key={tx.id}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <TransactionRow transaction={tx} onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: tx.id } })} />
              </View>
            ))
          ) : (
            <EmptyState
              icon="receipt-outline"
              title="Nothing here yet"
              message="Your latest transactions will show up here."
              actionLabel="Add transaction"
              onAction={() => router.push({ pathname: '/transaction/[id]', params: { id: 'new' } })}
            />
          )}
        </Card>
      </View>
    </Screen>
  );
}

function chartFallback(index: number): string {
  const palette = ['#0F172A', '#3B82F6', '#F59E0B', '#10B981', '#8B5CF6'];
  return palette[index % palette.length];
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLabel: {
    ...font.caption,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 11,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
  },
  heroBadgeText: {
    ...font.tiny,
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroValue: {
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -1.2,
    marginTop: spacing.xs,
  },
  heroNet: {
    ...font.caption,
    color: 'rgba(255,255,255,0.65)',
  },
  heroDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginVertical: spacing.md,
  },
  heroRow: {
    flexDirection: 'row',
  },
  heroColumn: {
    flex: 1,
    gap: 2,
  },
  heroColumnLabel: {
    ...font.tiny,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroColumnValue: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: colors.white,
  },
  incomeText: {
    color: '#34D399',
  },
  expenseText: {
    color: '#FB7185',
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  block: {
    gap: spacing.sm,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  budgetList: {
    gap: spacing.lg,
  },
  budgetItem: {
    gap: spacing.sm,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  budgetName: {
    ...font.bodyStrong,
    color: colors.ink,
    flexShrink: 1,
  },
  budgetAmount: {
    ...font.caption,
    color: colors.muted,
  },
  recentCard: {
    paddingVertical: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
  },
});
