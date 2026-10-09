import { addMonths, addWeeks, addYears, isBefore, parseISO } from 'date-fns';

import { toISODate } from '@/lib/dates';
import { uid } from '@/lib/id';
import { RecurringRule, Transaction } from '@/types';

/** The nth occurrence of a rule, always computed from the startDate anchor (no drift). */
function occurrenceAt(rule: RecurringRule, index: number): string {
  const start = parseISO(rule.startDate);
  if (rule.frequency === 'weekly') return toISODate(addWeeks(start, index));
  if (rule.frequency === 'monthly') return toISODate(addMonths(start, index));
  return toISODate(addYears(start, index));
}

/** Smallest index n whose occurrence is strictly after `fromDate`. */
function indexAfter(rule: RecurringRule, fromDate: string): number {
  const limit = parseISO(fromDate);
  let index = 0;
  while (!isBefore(limit, parseISO(occurrenceAt(rule, index))) && index < 1000) {
    index += 1;
  }
  return index;
}

/** First occurrence that has not been generated yet. */
export function nextDueDate(rule: RecurringRule): string {
  if (!rule.lastGenerated) return rule.startDate;
  return occurrenceAt(rule, indexAfter(rule, rule.lastGenerated));
}

export interface RecurringGenerationResult {
  transactions: Transaction[];
  updatedRules: RecurringRule[];
}

/**
 * Materialize every due occurrence up to `today`.
 * Runs on app launch — Expo Go has no background scheduling.
 */
export function generateDueOccurrences(
  rules: RecurringRule[],
  existing: Transaction[],
  today: string,
): RecurringGenerationResult {
  const seen = new Set(existing.map((tx) => `${tx.recurringId ?? ''}:${tx.date}`));
  const created: Transaction[] = [];
  const updatedRules: RecurringRule[] = [];

  for (const rule of rules) {
    if (!rule.active || !rule.startDate) continue;

    let index = rule.lastGenerated ? indexAfter(rule, rule.lastGenerated) : 0;
    let cursor = occurrenceAt(rule, index);
    let lastGenerated = rule.lastGenerated;
    // Max occurrences = months/weeks/years between startDate and today + buffer
    const start = parseISO(rule.startDate);
    const end = parseISO(today);
    const maxOccurrences = rule.frequency === 'weekly'
      ? Math.ceil((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 10
      : rule.frequency === 'monthly'
        ? (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 10
        : end.getFullYear() - start.getFullYear() + 10;

    let guard = 0;

    while (!isBefore(parseISO(today), parseISO(cursor)) && guard < maxOccurrences) {
      const key = `${rule.id}:${cursor}`;
      const alreadyMade = seen.has(key) || created.some((tx) => `${tx.recurringId}:${tx.date}` === key);
      if (!alreadyMade) {
        const now = new Date().toISOString();
        created.push({
          id: uid('tx-'),
          type: rule.type,
          amount: rule.amount,
          categoryId: rule.categoryId,
          date: cursor,
          note: rule.note,
          recurringId: rule.id,
          createdAt: now,
          updatedAt: now,
        });
        seen.add(key);
      }
      lastGenerated = cursor;
      index += 1;
      const next = occurrenceAt(rule, index);
      if (next === cursor) break;
      cursor = next;
      guard += 1;
    }

    if (lastGenerated !== rule.lastGenerated) {
      updatedRules.push({ ...rule, lastGenerated });
    }
  }

  return { transactions: created, updatedRules };
}
