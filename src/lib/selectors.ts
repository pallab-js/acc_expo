import { getCategory } from '@/lib/categories';
import { monthKeyOf, monthWindow, shiftMonth } from '@/lib/dates';
import { Budget, Category, RecurringRule, Transaction, TxType } from '@/types';

export interface MonthStats {
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
  count: number;
}

/** Build an index of transactions by month key for O(1) month lookups. */
export function buildTransactionIndex(transactions: Transaction[]): Map<string, Transaction[]> {
  const index = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const key = monthKeyOf(tx.date);
    const arr = index.get(key);
    if (arr) arr.push(tx);
    else index.set(key, [tx]);
  }
  return index;
}

/** Get transactions for a month using a pre-built index. */
export function inMonthIndexed(index: Map<string, Transaction[]>, monthKey: string): Transaction[] {
  return index.get(monthKey) ?? [];
}

/** Build an index of transactions by recurringId for O(1) rule lookups. */
export function buildRecurringTransactionIndex(transactions: Transaction[]): Map<string, Transaction[]> {
  const index = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    if (tx.recurringId) {
      const arr = index.get(tx.recurringId);
      if (arr) arr.push(tx);
      else index.set(tx.recurringId, [tx]);
    }
  }
  return index;
}

/** Build a map of recurring rules by ID for O(1) lookups. */
export function buildRecurringRuleIndex(rules: RecurringRule[]): Map<string, RecurringRule> {
  const index = new Map<string, RecurringRule>();
  for (const rule of rules) {
    index.set(rule.id, rule);
  }
  return index;
}

export function inMonth(transactions: Transaction[], monthKey: string): Transaction[] {
  return transactions.filter((tx) => monthKeyOf(tx.date) === monthKey);
}

export function monthStats(transactions: Transaction[], monthKey: string): MonthStats {
  const items = inMonth(transactions, monthKey);
  let income = 0;
  let expense = 0;
  for (const tx of items) {
    if (tx.type === 'income') income += tx.amount;
    else expense += tx.amount;
  }
  const net = income - expense;
  const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0;
  return { income, expense, net, savingsRate, count: items.length };
}

export function monthStatsIndexed(index: Map<string, Transaction[]>, monthKey: string): MonthStats {
  const items = inMonthIndexed(index, monthKey);
  let income = 0;
  let expense = 0;
  for (const tx of items) {
    if (tx.type === 'income') income += tx.amount;
    else expense += tx.amount;
  }
  const net = income - expense;
  const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0;
  return { income, expense, net, savingsRate, count: items.length };
}

export function allTimeBalance(transactions: Transaction[]): number {
  return transactions.reduce(
    (total, tx) => total + (tx.type === 'income' ? tx.amount : -tx.amount),
    0,
  );
}

export interface CategoryShare {
  category: Category;
  amount: number;
  percent: number;
}

export function categoryBreakdown(
  transactions: Transaction[],
  monthKey: string,
  type: TxType = 'expense',
): CategoryShare[] {
  const totals = new Map<string, number>();
  for (const tx of inMonth(transactions, monthKey)) {
    if (tx.type !== type) continue;
    totals.set(tx.categoryId, (totals.get(tx.categoryId) ?? 0) + tx.amount);
  }
  const total = [...totals.values()].reduce((sum, value) => sum + value, 0);
  return [...totals.entries()]
    .map(([categoryId, amount]) => ({
      category: getCategory(categoryId),
      amount,
      percent: total > 0 ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export interface TrendPoint {
  monthKey: string;
  label: string;
  income: number;
  expense: number;
}

export function trendSeries(transactions: Transaction[], endKey: string, count = 6): TrendPoint[] {
  return monthWindow(endKey, count).map((key) => {
    const stats = monthStats(transactions, key);
    return {
      monthKey: key,
      label: key.slice(5),
      income: stats.income,
      expense: stats.expense,
    };
  });
}

export function trendSeriesIndexed(index: Map<string, Transaction[]>, endKey: string, count = 6): TrendPoint[] {
  return monthWindow(endKey, count).map((key) => {
    const stats = monthStatsIndexed(index, key);
    return {
      monthKey: key,
      label: key.slice(5),
      income: stats.income,
      expense: stats.expense,
    };
  });
}

export type BudgetStatus = 'ok' | 'warn' | 'over';

export interface BudgetState {
  budget: Budget;
  category: Category;
  spent: number;
  remaining: number;
  percent: number;
  status: BudgetStatus;
}

export function budgetStates(
  budgets: Budget[],
  transactions: Transaction[],
  monthKey: string,
): BudgetState[] {
  const monthItems = inMonth(transactions, monthKey);
  return budgets
    .filter((budget) => budget.month === monthKey)
    .map((budget) => {
      const spent = monthItems
        .filter((tx) => tx.type === 'expense' && tx.categoryId === budget.categoryId)
        .reduce((sum, tx) => sum + tx.amount, 0);
      const percent = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;
      const status: BudgetStatus = percent >= 100 ? 'over' : percent >= 75 ? 'warn' : 'ok';
      return {
        budget,
        category: getCategory(budget.categoryId),
        spent,
        remaining: budget.amount - spent,
        percent,
        status,
      };
    })
    .sort((a, b) => b.percent - a.percent);
}

export function budgetsForMonth(budgets: Budget[], monthKey: string): Budget[] {
  return budgets.filter((budget) => budget.month === monthKey);
}

export interface TransactionFilter {
  query?: string;
  type?: TxType | 'all';
}

export function filterTransactions(transactions: Transaction[], filter: TransactionFilter): Transaction[] {
  const query = (filter.query ?? '').trim().toLowerCase();
  return transactions.filter((tx) => {
    if (filter.type && filter.type !== 'all' && tx.type !== filter.type) return false;
    if (!query) return true;
    const category = getCategory(tx.categoryId).name.toLowerCase();
    return category.includes(query) || (tx.note ?? '').toLowerCase().includes(query);
  });
}

export function sortNewestFirst(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? 1 : -1));
}

export function recentTransactions(transactions: Transaction[], count: number): Transaction[] {
  return sortNewestFirst(transactions).slice(0, count);
}

export interface UpcomingRule extends RecurringRule {
  nextDue: string;
}

export function rulesWithNextDue(rules: RecurringRule[], nextDueOf: (rule: RecurringRule) => string): UpcomingRule[] {
  return rules
    .map((rule) => ({ ...rule, nextDue: nextDueOf(rule) }))
    .sort((a, b) => (a.nextDue < b.nextDue ? -1 : 1));
}

export { shiftMonth };
