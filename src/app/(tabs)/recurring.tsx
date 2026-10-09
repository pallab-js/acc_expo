import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { CategoryIcon } from '@/components/CategoryIcon';
import { EmptyState } from '@/components/EmptyState';
import { FAB } from '@/components/FAB';
import { Screen } from '@/components/Screen';
import { formatShortDate } from '@/lib/dates';
import { formatMoney } from '@/lib/money';
import { nextDueDate } from '@/lib/recurring';
import { useStore } from '@/store/useStore';
import { colors, font, spacing, tabular } from '@/theme';

const FREQUENCY_LABEL = {
  weekly: 'Every week',
  monthly: 'Every month',
  yearly: 'Every year',
} as const;

export default function RecurringScreen() {
  const hydrated = useStore((state) => state.hydrated);
  const recurring = useStore((state) => state.recurring);
  const settings = useStore((state) => state.settings);
  const updateRule = useStore((state) => state.updateRule);

  const rules = useMemo(
    () =>
      [...recurring]
        .map((rule) => ({ rule, nextDue: nextDueDate(rule) }))
        .sort((a, b) => (a.nextDue < b.nextDue ? -1 : 1)),
    [recurring],
  );

  return (
    <Screen
      title="Recurring"
      subtitle="Auto-created when they come due"
      fab={
        <FAB
          label="Add recurring rule"
          onPress={() => router.push({ pathname: '/recurring/[id]', params: { id: 'new' } })}
        />
      }>
      {hydrated && rules.length === 0 ? (
        <EmptyState
          icon="repeat-outline"
          title="No recurring items"
          message="Rent, salary and subscriptions are created automatically when due."
          actionLabel="Create rule"
          onAction={() => router.push({ pathname: '/recurring/[id]', params: { id: 'new' } })}
        />
      ) : (
        rules.map(({ rule, nextDue }) => (
          <Pressable
            key={rule.id}
            onPress={() => router.push({ pathname: '/recurring/[id]', params: { id: rule.id } })}
            style={({ pressed }) => [pressed && styles.pressed]}>
            <Card style={styles.card}>
              <View style={styles.row}>
                <CategoryIcon categoryId={rule.categoryId} />
                <View style={styles.info}>
                  <Text style={styles.title} numberOfLines={1}>
                    {rule.note || FREQUENCY_LABEL[rule.frequency]}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {FREQUENCY_LABEL[rule.frequency]} · next {formatShortDate(nextDue)}
                  </Text>
                </View>
                <View style={styles.right}>
                  <Text style={[styles.amount, tabular, { color: rule.type === 'income' ? colors.income : colors.ink }]}>
                    {rule.type === 'income' ? '+' : '−'}
                    {formatMoney(rule.amount, settings.currency)}
                  </Text>
                  <Switch
                    value={rule.active}
                    onValueChange={(value) => { updateRule(rule.id, { active: value }); }}
                    trackColor={{ false: colors.border, true: colors.ink }}
                    thumbColor={colors.white}
                    ios_backgroundColor={colors.border}
                    style={styles.switch}
                  />
                </View>
              </View>
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    ...font.bodyStrong,
    color: colors.ink,
  },
  meta: {
    ...font.caption,
    color: colors.muted,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  switch: {
    alignSelf: 'flex-end',
  },
  amount: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
