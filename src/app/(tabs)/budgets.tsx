import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { CategoryIcon } from '@/components/CategoryIcon';
import { EmptyState } from '@/components/EmptyState';
import { FAB } from '@/components/FAB';
import { MonthStepper } from '@/components/MonthStepper';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import {
  monthKeyOfDate,
  monthLabel,
  nextMonthKey,
  prevMonthKey,
} from '@/lib/dates';
import { formatMoney } from '@/lib/money';
import { budgetStates, BudgetStatus } from '@/lib/selectors';
import { useStore } from '@/store/useStore';
import { colors, font, spacing, tabular } from '@/theme';

const STATUS_COLORS: Record<BudgetStatus, string> = {
  ok: colors.income,
  warn: colors.warn,
  over: colors.expense,
};

const STATUS_LABEL: Record<BudgetStatus, string> = {
  ok: 'On track',
  warn: 'Getting close',
  over: 'Over budget',
};

export default function BudgetsScreen() {
  const hydrated = useStore((state) => state.hydrated);
  const transactions = useStore((state) => state.transactions);
  const budgets = useStore((state) => state.budgets);
  const settings = useStore((state) => state.settings);
  const [monthKey, setMonthKey] = useState(() => monthKeyOfDate(new Date()));

  const states = useMemo(
    () => budgetStates(budgets, transactions, monthKey),
    [budgets, transactions, monthKey],
  );
  const totals = useMemo(() => {
    const limit = states.reduce((sum, state) => sum + state.budget.amount, 0);
    const spent = states.reduce((sum, state) => sum + state.spent, 0);
    return { limit, spent, remaining: limit - spent };
  }, [states]);

  const currency = settings.currency;
  const currentMonthKey = monthKeyOfDate(new Date());

  return (
    <Screen
      title="Budgets"
      subtitle={`Monthly limits for ${monthLabel(monthKey)}`}
      fab={<FAB label="Add budget" onPress={() => router.push({ pathname: '/budget/[id]', params: { id: 'new' } })} />}>
      <MonthStepper
        label={monthLabel(monthKey)}
        onPrev={() => setMonthKey(prevMonthKey)}
        onNext={() => setMonthKey(nextMonthKey)}
        nextDisabled={monthKey >= currentMonthKey}
      />

      <Card>
        <View style={styles.overallHeader}>
          <View>
            <Text style={styles.overallLabel}>Total budget</Text>
            <Text style={[styles.overallValue, tabular]}>{formatMoney(totals.limit, currency)}</Text>
          </View>
          <View style={styles.overallRight}>
            <Text style={styles.overallLabel}>Spent</Text>
            <Text style={[styles.overallSpent, tabular]}>
              {formatMoney(totals.spent, currency)}
            </Text>
          </View>
        </View>
        <ProgressBar
          progress={totals.limit > 0 ? totals.spent / totals.limit : 0}
          color={
            totals.limit > 0 && totals.spent > totals.limit
              ? colors.expense
              : totals.limit > 0 && totals.spent / totals.limit >= 0.75
                ? colors.warn
                : colors.ink
          }
          height={10}
        />
        <Text style={[styles.overallRemaining, tabular]}>
          {totals.remaining >= 0
            ? `${formatMoney(totals.remaining, currency)} remaining`
            : `${formatMoney(Math.abs(totals.remaining), currency)} over budget`}
        </Text>
      </Card>

      {hydrated && states.length > 0 ? (
        <View style={styles.list}>
          <SectionHeader title={`By category (${states.length})`} />
          {states.map((state) => (
            <Pressable
              key={state.budget.id}
              onPress={() =>
                router.push({ pathname: '/budget/[id]', params: { id: state.budget.id } })
              }
              style={({ pressed }) => [pressed && styles.pressed]}>
              <Card style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <CategoryIcon categoryId={state.category.id} size={36} />
                  <View style={styles.budgetInfo}>
                    <Text style={styles.budgetName}>{state.category.name}</Text>
                    <Text style={[styles.budgetMeta, tabular]}>
                      {formatMoney(state.spent, currency)} of {formatMoney(state.budget.amount, currency)}
                    </Text>
                  </View>
                  <View style={styles.budgetBadge}>
                    <Text style={[styles.budgetPercent, tabular, { color: STATUS_COLORS[state.status] }]}>
                      {state.percent}%
                    </Text>
                    <Text style={[styles.budgetStatus, { color: STATUS_COLORS[state.status] }]}>
                      {STATUS_LABEL[state.status]}
                    </Text>
                  </View>
                </View>
                <ProgressBar
                  progress={state.spent / state.budget.amount}
                  color={STATUS_COLORS[state.status]}
                />
              </Card>
            </Pressable>
          ))}
        </View>
      ) : null}

      {hydrated && states.length === 0 ? (
        <EmptyState
          icon="wallet-outline"
          title="No budgets for this month"
          message="Create category limits to track spending against a plan."
          actionLabel="Create budget"
          onAction={() => router.push({ pathname: '/budget/[id]', params: { id: 'new' } })}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  overallLabel: {
    ...font.tiny,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  overallValue: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.4,
  },
  overallRight: {
    alignItems: 'flex-end',
  },
  overallSpent: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.inkSecondary,
  },
  overallRemaining: {
    ...font.caption,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  list: {
    gap: spacing.md,
  },
  budgetCard: {
    gap: spacing.md,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  budgetInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  budgetName: {
    ...font.bodyStrong,
    color: colors.ink,
  },
  budgetMeta: {
    ...font.caption,
    color: colors.muted,
  },
  budgetBadge: {
    alignItems: 'flex-end',
    gap: 2,
  },
  budgetPercent: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  budgetStatus: {
    ...font.tiny,
    fontSize: 10,
  },
  pressed: {
    opacity: 0.7,
  },
});
