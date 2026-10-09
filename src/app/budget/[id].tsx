import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { FormHeader } from '@/components/FormHeader';
import { Segmented } from '@/components/Segmented';
import { categoriesFor } from '@/lib/categories';
import { parseDisplayDate, toISODate, todayISO } from '@/lib/dates';
import { parseMoneyToMinor } from '@/lib/money';
import { useStore } from '@/store/useStore';
import { colors, font, radius, spacing } from '@/theme';

export default function BudgetForm() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : 'new';
  const isNew = id === 'new';

  const budgets = useStore((state) => state.budgets);
  const hydrated = useStore((state) => state.hydrated);
  const addBudget = useStore((state) => state.addBudget);
  const updateBudget = useStore((state) => state.updateBudget);
  const removeBudget = useStore((state) => state.removeBudget);

  const existing = useMemo(
    () => (isNew ? undefined : budgets.find((budget) => budget.id === id)),
    [isNew, budgets, id],
  );

  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? '');
  const [amountRaw, setAmountRaw] = useState(existing ? (existing.amount / 100).toFixed(2) : '');
  const [month, setMonth] = useState(existing?.month ?? todayISO().slice(0, 7));
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(() => categoriesFor('expense'), []);
  const taken = useMemo(
    () => new Set(budgets.filter((budget) => budget.month === month && budget.id !== id).map((budget) => budget.categoryId)),
    [budgets, month, id],
  );
  const amountMinor = parseMoneyToMinor(amountRaw);
  const canSave = amountMinor !== null && amountMinor > 0 && Boolean(categoryId);

  const monthDate = parseDisplayDate(`${month}-01`);
  const now = new Date();
  const minMonth = new Date(now.getFullYear(), now.getMonth() - 12, 1);
  const maxMonth = new Date(now.getFullYear(), now.getMonth() + 12, 1);

  const onSave = async () => {
    if (!canSave || amountMinor === null) return;
    setError(null);
    try {
      if (isNew) {
        await addBudget({ categoryId, amount: amountMinor, month });
      } else if (existing) {
        await updateBudget(existing.id, { categoryId, amount: amountMinor, month });
      }
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save budget');
    }
  };

  const onDelete = () => {
    if (!existing) return;
    Alert.alert('Delete budget?', 'Spent amounts are not affected.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeBudget(existing.id);
          router.back();
        },
      },
    ]);
  };

  if (!isNew && hydrated && !existing) {
    return (
      <View style={styles.root}>
        <FormHeader title="Budget" leftLabel="Close" onLeft={() => router.back()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Budget not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FormHeader
        title={isNew ? 'New budget' : 'Edit budget'}
        leftLabel="Cancel"
        onLeft={() => router.back()}
        rightLabel="Save"
        onRight={onSave}
        rightDisabled={!canSave}
      />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.amountBlock}>
            <Text style={styles.amountLabel}>Monthly limit</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currency}>₹</Text>
              <TextInput
                value={amountRaw}
                onChangeText={setAmountRaw}
                placeholder="0.00"
                placeholderTextColor={colors.faint}
                keyboardType="decimal-pad"
                style={styles.amountInput}
                maxLength={12}
              />
            </View>
          </View>

          <View>
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.chipWrap}>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  label={category.name}
                  selected={categoryId === category.id}
                  onPress={() => setCategoryId(category.id)}
                />
              ))}
            </View>
            {categoryId && taken.has(categoryId) && !existing ? (
              <Text style={styles.warning}>A budget already exists here for this month — saving will add a second limit.</Text>
            ) : null}
            {error ? <Text style={styles.warning}>{error}</Text> : null}
          </View>

          <View>
            <Text style={styles.fieldLabel}>Month</Text>
            <Segmented
              options={[
                { value: 'current', label: 'This month' },
                { value: 'pick', label: format(monthDate, 'MMM yyyy') },
              ]}
              value={showPicker || month !== todayISO().slice(0, 7) ? 'pick' : 'current'}
              onChange={(value) => {
                if (value === 'current') {
                  setMonth(todayISO().slice(0, 7));
                  setShowPicker(false);
                } else {
                  setShowPicker(true);
                }
              }}
            />
            {showPicker ? (
              <View style={styles.picker}>
                <DateTimePicker
                  value={monthDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                  minimumDate={minMonth}
                  maximumDate={maxMonth}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS !== 'ios') setShowPicker(false);
                    if (event.type === 'set' && selectedDate) {
                      setMonth(toISODate(selectedDate).slice(0, 7));
                    }
                  }}
                />
                {Platform.OS === 'ios' ? (
                  <Button label="Done" variant="secondary" onPress={() => setShowPicker(false)} style={styles.pickerDone} />
                ) : null}
              </View>
            ) : null}
          </View>

          <Button label={isNew ? 'Create budget' : 'Save changes'} onPress={onSave} disabled={!canSave} />
          {existing ? <Button label="Delete budget" variant="danger" onPress={onDelete} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: 48,
  },
  amountBlock: {
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  amountLabel: {
    ...font.tiny,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  currency: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.faint,
  },
  amountInput: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -1,
    minWidth: 120,
    textAlign: 'center',
  },
  fieldLabel: {
    ...font.captionStrong,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontSize: 11,
    marginBottom: spacing.sm,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  warning: {
    ...font.caption,
    color: colors.warn,
    marginTop: spacing.sm,
  },
  picker: {
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  pickerDone: {
    marginTop: spacing.sm,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    ...font.body,
    color: colors.muted,
  },
});
