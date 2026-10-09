import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { FormHeader } from '@/components/FormHeader';
import { Segmented } from '@/components/Segmented';
import { TextField } from '@/components/TextField';
import { formatFullDate, parseDisplayDate, toISODate, todayISO } from '@/lib/dates';
import { categoriesFor } from '@/lib/categories';
import { parseMoneyToMinor } from '@/lib/money';
import { useStore } from '@/store/useStore';
import { Frequency, TxType } from '@/types';
import { colors, font, radius, spacing, tabular } from '@/theme';

type Repeat = Frequency | 'none';

export default function TransactionForm() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : 'new';
  const isNew = id === 'new';

  const transactions = useStore((state) => state.transactions);
  const hydrated = useStore((state) => state.hydrated);
  const addTransaction = useStore((state) => state.addTransaction);
  const updateTransaction = useStore((state) => state.updateTransaction);
  const removeTransaction = useStore((state) => state.removeTransaction);
  const addRule = useStore((state) => state.addRule);

  const existing = useMemo(
    () => (isNew ? undefined : transactions.find((tx) => tx.id === id)),
    [isNew, transactions, id],
  );

  const [type, setType] = useState<TxType>(existing?.type ?? 'expense');
  const [amountRaw, setAmountRaw] = useState(existing ? (existing.amount / 100).toFixed(2) : '');
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? '');
  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [note, setNote] = useState(existing?.note ?? '');
  const [repeat, setRepeat] = useState<Repeat>('none');
  const [showPicker, setShowPicker] = useState(false);

  const categories = useMemo(() => categoriesFor(type), [type]);
  const amountMinor = parseMoneyToMinor(amountRaw);
  const canSave = amountMinor !== null && amountMinor > 0 && Boolean(categoryId);

  const onTypeChange = (next: TxType) => {
    setType(next);
    const valid = categoriesFor(next).some((category) => category.id === categoryId);
    if (!valid) setCategoryId('');
  };

  const onSave = async () => {
    if (!canSave || amountMinor === null) return;
    const trimmedNote = note.trim() || undefined;
    if (isNew) {
      await addTransaction({ type, amount: amountMinor, categoryId, date, note: trimmedNote });
      if (repeat !== 'none') {
        await addRule({
          type,
          amount: amountMinor,
          categoryId,
          frequency: repeat,
          startDate: date,
          note: trimmedNote,
          active: true,
        });
      }
    } else if (existing) {
      await updateTransaction(existing.id, {
        type,
        amount: amountMinor,
        categoryId,
        date,
        note: trimmedNote,
      });
    }
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    router.back();
  };

  const onDelete = () => {
    if (!existing) return;
    Alert.alert('Delete transaction?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeTransaction(existing.id);
          router.back();
        },
      },
    ]);
  };

  if (!isNew && hydrated && !existing) {
    return (
      <View style={styles.root}>
        <FormHeader title="Transaction" leftLabel="Close" onLeft={() => router.back()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Transaction not found.</Text>
        </View>
      </View>
    );
  }

  const isToday = date === todayISO();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date === toISODate(yesterday);

  return (
    <View style={styles.root}>
      <FormHeader
        title={isNew ? 'New transaction' : 'Edit transaction'}
        leftLabel="Cancel"
        onLeft={() => router.back()}
        rightLabel="Save"
        onRight={onSave}
        rightDisabled={!canSave}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={12}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Segmented<TxType>
            options={[
              { value: 'expense', label: 'Expense' },
              { value: 'income', label: 'Income' },
            ]}
            value={type}
            onChange={onTypeChange}
          />

          <View style={styles.amountBlock}>
            <Text style={styles.amountLabel}>Amount</Text>
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
            <View style={styles.quickRow}>
              {[100, 500, 1000, 2500].map((value) => (
                <Chip
                  key={value}
                  label={`+${value}`}
                  onPress={() => {
                    const current = parseMoneyToMinor(amountRaw) ?? 0;
                    setAmountRaw(((current + value * 100) / 100).toFixed(2));
                  }}
                />
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.chipWrap}>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  label={category.name}
                  icon={category.icon as keyof typeof Ionicons.glyphMap}
                  iconColor={category.color}
                  selected={categoryId === category.id}
                  onPress={() => setCategoryId(category.id)}
                />
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.fieldLabel}>Date</Text>
            <View style={styles.chipWrap}>
              <Chip label="Today" selected={isToday} onPress={() => setDate(todayISO())} />
              <Chip label="Yesterday" selected={isYesterday} onPress={() => setDate(toISODate(yesterday))} />
              <Chip
                label={formatFullDate(date)}
                icon="calendar-outline"
                selected={!isToday && !isYesterday}
                onPress={() => setShowPicker((value) => !value)}
              />
            </View>
            {showPicker ? (
              <View style={styles.picker}>
                <DateTimePicker
                  value={parseDisplayDate(date)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  maximumDate={new Date(2100, 0, 1)}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS !== 'ios') setShowPicker(false);
                    if (event.type === 'set' && selectedDate) {
                      setDate(toISODate(selectedDate));
                    }
                    if (Platform.OS === 'ios' && event.type === 'dismissed') {
                      setShowPicker(false);
                    }
                  }}
                />
                {Platform.OS === 'ios' ? (
                  <Button label="Done" variant="secondary" onPress={() => setShowPicker(false)} style={styles.pickerDone} />
                ) : null}
              </View>
            ) : null}
          </View>

          <TextField
            label="Note (optional)"
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Dinner with friends"
            maxLength={80}
          />

          {isNew ? (
            <View>
              <Text style={styles.fieldLabel}>Repeat</Text>
              <View style={styles.chipWrap}>
                {(
                  [
                    ['none', 'Never'],
                    ['weekly', 'Weekly'],
                    ['monthly', 'Monthly'],
                    ['yearly', 'Yearly'],
                  ] as [Repeat, string][]
                ).map(([value, label]) => (
                  <Chip key={value} label={label} selected={repeat === value} onPress={() => setRepeat(value)} />
                ))}
              </View>
              {repeat !== 'none' ? (
                <View style={styles.repeatHint}>
                  <Ionicons name="repeat-outline" size={14} color={colors.muted} />
                  <Text style={styles.repeatHintText}>
                    A matching entry is created automatically whenever it comes due.
                  </Text>
                </View>
              ) : null}
            </View>
          ) : existing?.recurringId ? (
            <View style={styles.repeatHint}>
              <Ionicons name="repeat-outline" size={14} color={colors.muted} />
              <Text style={styles.repeatHintText}>
                Part of a recurring series — edit the series under Recurring.
              </Text>
            </View>
          ) : null}

          <Button
            label={isNew ? 'Add transaction' : 'Save changes'}
            onPress={onSave}
            disabled={!canSave}
            style={styles.save}
          />
          {existing ? (
            <Button label="Delete transaction" variant="danger" onPress={onDelete} style={styles.delete} />
          ) : null}
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
    ...tabular,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
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
  repeatHint: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    marginTop: spacing.md,
    backgroundColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  repeatHintText: {
    ...font.caption,
    color: colors.muted,
    flex: 1,
  },
  save: {
    marginTop: spacing.xs,
  },
  delete: {
    marginTop: -spacing.sm,
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
