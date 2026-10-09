import { addMonths } from 'date-fns';

import { toISODate } from '@/lib/dates';
import { uid } from '@/lib/id';
import { Budget, RecurringRule, Transaction } from '@/types';

function makeRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

interface SeedData {
  transactions: Transaction[];
  budgets: Budget[];
  recurring: RecurringRule[];
}

/** Four months of believable activity so every dashboard widget has data. */
export function buildSeedData(today: Date): SeedData {
  const random = makeRandom(20260930);
  const now = new Date().toISOString();
  const transactions: Transaction[] = [];

  const push = (
    type: Transaction['type'],
    amountMinor: number,
    categoryId: string,
    date: string,
    note?: string,
    recurringId?: string,
  ) => {
    transactions.push({
      id: uid('tx-'),
      type,
      amount: amountMinor,
      categoryId,
      date,
      note,
      recurringId,
      createdAt: now,
      updatedAt: now,
    });
  };

  const amount = (min: number, max: number) =>
    Math.round((min + random() * (max - min)) / 10) * 1000;

  const anchor = addMonths(new Date(today.getFullYear(), today.getMonth(), 3), -4);
  const salaryAnchor = addMonths(new Date(today.getFullYear(), today.getMonth(), 25), -4);
  const rentRule: RecurringRule = {
    id: uid('rule-'),
    type: 'expense',
    amount: 2400000,
    categoryId: 'cat-housing',
    frequency: 'monthly',
    startDate: toISODate(anchor),
    note: 'Apartment rent',
    active: true,
    lastGenerated: null,
    createdAt: now,
  };
  const salaryRule: RecurringRule = {
    id: uid('rule-'),
    type: 'income',
    amount: 11500000,
    categoryId: 'cat-salary',
    frequency: 'monthly',
    startDate: toISODate(salaryAnchor),
    note: 'Monthly salary',
    active: true,
    lastGenerated: null,
    createdAt: now,
  };
  const rules = [rentRule, salaryRule];

  for (let monthsBack = 4; monthsBack >= 0; monthsBack -= 1) {
    const monthDate = addMonths(new Date(today.getFullYear(), today.getMonth(), 1), -monthsBack);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const day = (n: number) => toISODate(new Date(year, month, Math.min(n, daysInMonth)));

    for (const rule of rules) {
      const anchorDate = new Date(rule.startDate);
      const dayOfMonth = anchorDate.getDate();
      const occurrence = new Date(year, month, Math.min(dayOfMonth, daysInMonth));
      if (occurrence > today) continue;
      push(rule.type, rule.amount, rule.categoryId, toISODate(occurrence), rule.note, rule.id);
    }

    const groceries = 3 + Math.floor(random() * 2);
    for (let i = 0; i < groceries; i += 1) {
      push('expense', amount(850, 3600), 'cat-groceries', day(2 + Math.floor(random() * 26)));
    }
    const meals = 6 + Math.floor(random() * 5);
    for (let i = 0; i < meals; i += 1) {
      push('expense', amount(180, 1250), 'cat-food', day(1 + Math.floor(random() * 27)));
    }
    const rides = 3 + Math.floor(random() * 4);
    for (let i = 0; i < rides; i += 1) {
      push('expense', amount(90, 780), 'cat-transport', day(1 + Math.floor(random() * 27)));
    }
    push('expense', amount(1200, 2600), 'cat-utilities', day(7), 'Electricity & internet');
    push('expense', amount(700, 1800), 'cat-fun', day(10 + Math.floor(random() * 12)));
    if (random() > 0.45) {
      push('expense', amount(900, 6400), 'cat-shopping', day(5 + Math.floor(random() * 20)));
    }
    if (random() > 0.75) {
      push('expense', amount(400, 2200), 'cat-health', day(8 + Math.floor(random() * 15)));
    }
    if (monthsBack === 2 || monthsBack === 3) {
      push('income', amount(9000, 18000), 'cat-freelance', day(18), 'Design retainer');
    }
    if (monthsBack === 1) {
      push('expense', amount(3500, 9000), 'cat-education', day(12), 'Online course');
    }
  }

  const budgets: Budget[] = [];
  const budgetPlan: [string, number][] = [
    ['cat-housing', 2500000],
    ['cat-groceries', 900000],
    ['cat-food', 600000],
    ['cat-transport', 400000],
    ['cat-shopping', 500000],
    ['cat-fun', 300000],
  ];
  for (let monthsBack = 1; monthsBack >= 0; monthsBack -= 1) {
    const monthDate = addMonths(new Date(today.getFullYear(), today.getMonth(), 1), -monthsBack);
    const monthKey = toISODate(monthDate).slice(0, 7);
    for (const [categoryId, budgetAmount] of budgetPlan) {
      budgets.push({ id: uid('bud-'), categoryId, amount: budgetAmount, month: monthKey });
    }
  }

  for (const rule of rules) {
    const occurrences = transactions
      .filter((tx) => tx.recurringId === rule.id)
      .map((tx) => tx.date)
      .sort();
    rule.lastGenerated = occurrences.length ? occurrences[occurrences.length - 1] : null;
  }

  transactions.sort((a, b) => (a.date < b.date ? -1 : 1));
  return { transactions, budgets, recurring: rules };
}
