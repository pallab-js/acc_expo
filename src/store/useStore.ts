import { create } from 'zustand';

import { todayISO } from '@/lib/dates';
import { uid } from '@/lib/id';
import { generateDueOccurrences } from '@/lib/recurring';
import { clearAllCollections, loadCollection, saveCollection } from '@/storage/repository';
import { buildSeedData } from '@/storage/seed';
import {
  Budget,
  RecurringRule,
  Settings,
  Transaction,
  TransactionInput,
} from '@/types';

const DEFAULT_SETTINGS: Settings = { currency: 'INR', seeded: false };

interface StoreState {
  hydrated: boolean;
  hydrating: boolean;
  transactions: Transaction[];
  budgets: Budget[];
  recurring: RecurringRule[];
  settings: Settings;

  hydrate: () => Promise<void>;
  addTransaction: (input: TransactionInput) => Promise<Transaction>;
  updateTransaction: (id: string, patch: Partial<Transaction>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  addBudget: (input: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, patch: Partial<Budget>) => Promise<void>;
  removeBudget: (id: string) => Promise<void>;
  addRule: (input: Omit<RecurringRule, 'id' | 'createdAt' | 'lastGenerated'>) => Promise<void>;
  updateRule: (id: string, patch: Partial<RecurringRule>) => Promise<void>;
  removeRule: (id: string) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  resetToSample: () => Promise<void>;
  deleteAllData: () => Promise<void>;
}

function persistTransactions(transactions: Transaction[]) {
  return saveCollection('transactions', transactions);
}
function persistBudgets(budgets: Budget[]) {
  return saveCollection('budgets', budgets);
}
function persistRecurring(recurring: RecurringRule[]) {
  return saveCollection('recurring', recurring);
}
function persistSettings(settings: Settings) {
  return saveCollection('settings', settings);
}

export const useStore = create<StoreState>((set, get) => ({
  hydrated: false,
  hydrating: false,
  transactions: [],
  budgets: [],
  recurring: [],
  settings: DEFAULT_SETTINGS,

  hydrate: async () => {
    if (get().hydrated || get().hydrating) return;
    set({ hydrating: true });
    try {
      const [transactions, budgets, recurring, settings] = await Promise.all([
        loadCollection<Transaction[]>('transactions'),
        loadCollection<Budget[]>('budgets'),
        loadCollection<RecurringRule[]>('recurring'),
        loadCollection<Settings>('settings'),
      ]);

      const nextSettings = settings ?? DEFAULT_SETTINGS;
      let nextTransactions = transactions ?? [];
      let nextBudgets = budgets ?? [];
      let nextRecurring = recurring ?? [];

      if (!nextSettings.seeded && nextTransactions.length === 0) {
        const seed = buildSeedData(new Date());
        nextTransactions = seed.transactions;
        nextBudgets = seed.budgets;
        nextRecurring = seed.recurring;
        nextSettings.seeded = true;
        await Promise.all([
          persistTransactions(nextTransactions),
          persistBudgets(nextBudgets),
          persistRecurring(nextRecurring),
          persistSettings(nextSettings),
        ]);
      }

      const generation = generateDueOccurrences(nextRecurring, nextTransactions, todayISO());
      if (generation.transactions.length || generation.updatedRules.length) {
        nextTransactions = [...nextTransactions, ...generation.transactions];
        nextRecurring = nextRecurring.map(
          (rule) => generation.updatedRules.find((r) => r.id === rule.id) ?? rule,
        );
        await Promise.all([
          persistTransactions(nextTransactions),
          persistRecurring(nextRecurring),
        ]);
      }

      set({
        hydrated: true,
        hydrating: false,
        transactions: nextTransactions,
        budgets: nextBudgets,
        recurring: nextRecurring,
        settings: nextSettings,
      });
    } catch (error) {
      set({ hydrating: false });
      throw error;
    }
  },

  addTransaction: async (input) => {
    const now = new Date().toISOString();
    // Deduplicate: if input has recurringId, check for existing transaction with same recurringId + date
    if (input.recurringId) {
      const existing = get().transactions.find(
        (tx) => tx.recurringId === input.recurringId && tx.date === input.date,
      );
      if (existing) {
        return existing;
      }
    }
    const transaction: Transaction = { id: uid('tx-'), ...input, createdAt: now, updatedAt: now };
    const next = [...get().transactions, transaction];
    set({ transactions: next });
    await persistTransactions(next);
    return transaction;
  },

  updateTransaction: async (id, patch) => {
    const next = get().transactions.map((tx) =>
      tx.id === id ? { ...tx, ...patch, updatedAt: new Date().toISOString() } : tx,
    );
    set({ transactions: next });
    await persistTransactions(next);
  },

  removeTransaction: async (id) => {
    const next = get().transactions.filter((tx) => tx.id !== id);
    set({ transactions: next });
    await persistTransactions(next);
  },

  addBudget: async (input) => {
    // Enforce unique category per month
    const existingBudget = get().budgets.find(
      (b) => b.categoryId === input.categoryId && b.month === input.month,
    );
    if (existingBudget) {
      throw new Error(`Budget for this category and month already exists (ID: ${existingBudget.id})`);
    }
    const next = [...get().budgets, { id: uid('bud-'), ...input }];
    set({ budgets: next });
    await persistBudgets(next);
  },

  updateBudget: async (id, patch) => {
    // Enforce unique category per month
    const budget = get().budgets.find((b) => b.id === id);
    if (!budget) return;
    const newCategoryId = patch.categoryId ?? budget.categoryId;
    const newMonth = patch.month ?? budget.month;
    const existingBudget = get().budgets.find(
      (b) => b.id !== id && b.categoryId === newCategoryId && b.month === newMonth,
    );
    if (existingBudget) {
      throw new Error(`Budget for this category and month already exists (ID: ${existingBudget.id})`);
    }
    const next = get().budgets.map((b) => (b.id === id ? { ...b, ...patch } : b));
    set({ budgets: next });
    await persistBudgets(next);
  },

  removeBudget: async (id) => {
    const next = get().budgets.filter((budget) => budget.id !== id);
    set({ budgets: next });
    await persistBudgets(next);
  },

  addRule: async (input) => {
    const rule: RecurringRule = {
      id: uid('rule-'),
      createdAt: new Date().toISOString(),
      lastGenerated: null,
      ...input,
    };
    const next = [...get().recurring, rule];
    set({ recurring: next });
    await persistRecurring(next);
  },

  updateRule: async (id, patch) => {
    const next = get().recurring.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule));
    set({ recurring: next });
    await persistRecurring(next);
  },

  removeRule: async (id) => {
    const next = get().recurring.filter((rule) => rule.id !== id);
    set({ recurring: next });
    await persistRecurring(next);
  },

  updateSettings: async (patch) => {
    const next = { ...get().settings, ...patch };
    set({ settings: next });
    await persistSettings(next);
  },

  resetToSample: async () => {
    const seed = buildSeedData(new Date());
    const settings: Settings = { ...get().settings, seeded: true };
    set({
      transactions: seed.transactions,
      budgets: seed.budgets,
      recurring: seed.recurring,
      settings,
    });
    await Promise.all([
      persistTransactions(seed.transactions),
      persistBudgets(seed.budgets),
      persistRecurring(seed.recurring),
      persistSettings(settings),
    ]);
  },

  deleteAllData: async () => {
    const settings: Settings = { ...get().settings, seeded: true };
    set({ transactions: [], budgets: [], recurring: [], settings });
    await clearAllCollections();
    await Promise.all([
      persistTransactions([]),
      persistBudgets([]),
      persistRecurring([]),
      persistSettings(settings),
    ]);
  },
}));
