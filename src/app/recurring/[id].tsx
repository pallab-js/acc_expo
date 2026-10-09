import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
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
import { categoriesFor } from '@/lib/categories';
import { formatFullDate, parseDisplayDate, toISODate, todayISO } from '@/lib/dates';
import { parseMoneyToMinor } from '@/lib/money';
import { useStore } from '@/store/useStore';
import { Frequency, TxType } from '@/types';
import { colors, font, radius, spacing, tabular } from '@/theme';

const FREQUENCY_OPTIONS: [Frequency, string][] = [
  ['weekly', 'Weekly'],
  ['monthly', 'Monthly'],
  ['yearly', 'Yearly'],
];

export default function RecurringForm() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : 'new';
  const isNew = id === 'new';

  const recurring = useStore((state) => state.recurring);
  const hydrated = useStore((state) => state.hydrated);
  const addRule = useStore((state) => state.addRule);
  const updateRule = useStore((state) => state.updateRule);
  const removeRule = useStore((state) => state.removeRule);

  const existing = useMemo(
    () => (isNew ? undefined : recurring.find((rule) => rule.id === id)),
    [isNew, recurring, id],
  );

  const [type, setType] = useState<TxType>(existing?.type ?? 'expense');
  const [amountRaw, setAmountRaw] = useState(existing ? (existing.amount / 100).toFixed(2) : '');
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? '');
  const [frequency, setFrequency] = useState<Frequency>(existing?.frequency ?? 'monthly');
  const [startDate, setStartDate] = useState(existing?.startDate ?? todayISO());
  const [note, setNote] = useState(existing?.note ?? '');
  const [active, setActive] = useState(existing?.active ?? true);
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
      await addRule({ type, amount: amountMinor, categoryId, frequency, startDate, note: trimmedNote, active });
    } else if (existing) {
      await updateRule(existing.id, { type, amount: amountMinor, categoryId, frequency, startDate, note: trimmedNote, active });
    }
    router.back();
  };

  const onDelete = () => {
    if (!existing) return;
    Alert.alert(
      'Delete rule?',
      'Entries already created from this rule stay in your history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeRule(existing.id);
            router.back();
          },
        },
      ],
    );
  };

  if (!isNew && hydrated && !existing) {
    return (
      <View style={styles.root}>
        <FormHeader title="Recurring" leftLabel="Close" onLeft={() => router.back()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Rule not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FormHeader
        title={isNew ? 'New recurring' : 'Edit recurring'}
        leftLabel="Cancel"
        onLeft={() => router.back()}
        rightLabel="Save"
        onRight={onSave}
        rightDisabled={!canSave}
      />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
            <Text style={styles.amountLabel}>Amount per occurrence</Text>
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
            <Text style={styles.fieldLabel}>Frequency</Text>
            <View style={styles.chipWrap}>
              {FREQUENCY_OPTIONS.map(([value, label]) => (
                <Chip key={value} label={label} selected={frequency === value} onPress={() => setFrequency(value)} />
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
            <Text style={styles.fieldLabel}>First due date</Text>
            <View style={styles.chipWrap}>
              <Chip label="Today" selected={startDate === todayISO()} onPress={() => setStartDate(todayISO())} />
              <Chip
                label={formatFullDate(startDate)}
                icon="calendar-outline"
                selected={startDate !== todayISO()}
                onPress={() => setShowPicker((value) => !value)}
              />
            </View>
            {showPicker ? (
              <View style={styles.picker}>
                <DateTimePicker
                  value={parseDisplayDate(startDate)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS !== 'ios') setShowPicker(false);
                    if (event.type === 'set' && selectedDate) {
                      setStartDate(toISODate(selectedDate));
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
            label="Label (optional)"
            value={note}
            onChangeText={setNote}
            placeholder={type === 'income' ? 'e.g. Monthly salary' : 'e.g. Apartment rent'}
            maxLength={80}
          />

          <View style={styles.activeRow}>
            <View style={styles.activeText}>
              <Text style={styles.activeTitle}>Active</Text>
              <Text style={styles.activeCaption}>Paused rules do not create entries.</Text>
            </View>
            <Switch
              value={active}
              onValueChange={setActive}
              trackColor={{ false: colors.border, true: colors.ink }}
              thumbColor={colors.white}
              ios_backgroundColor={colors.border}
            />
          </View>

          <View style={styles.hint}>
            <Ionicons name="time-outline" size={14} color={colors.muted} />
            <Text style={styles.hintText}>
              Entries are materialised the next time you open the app — no server needed.
            </Text>
          </View>

          <Button label={isNew ? 'Create rule' : 'Save changes'} onPress={onSave} disabled={!canSave} />
          {existing ? <Button label="Delete rule" variant="danger" onPress={onDelete} /> : null}
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
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  activeText: {
    flex: 1,
    gap: 2,
  },
  activeTitle: {
    ...font.bodyStrong,
    color: colors.ink,
  },
  activeCaption: {
    ...font.caption,
    color: colors.muted,
  },
  hint: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: colors.hairline,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  hintText: {
    ...font.caption,
    color: colors.muted,
    flex: 1,
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
