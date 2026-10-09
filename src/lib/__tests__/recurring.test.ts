import { generateDueOccurrences, nextDueDate } from '../recurring';
import { RecurringRule, Transaction } from '@/types';

function makeRule(overrides: Partial<RecurringRule> = {}): RecurringRule {
  return {
    id: 'rule-1',
    type: 'expense',
    amount: 100000,
    categoryId: 'cat-rent',
    frequency: 'monthly',
    startDate: '2024-01-15',
    note: 'Rent',
    active: true,
    lastGenerated: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'tx-1',
    type: 'expense',
    amount: 100000,
    categoryId: 'cat-rent',
    date: '2024-01-15',
    recurringId: 'rule-1',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    ...overrides,
  };
}

describe('recurring.ts', () => {
  describe('nextDueDate', () => {
    it('returns startDate when lastGenerated is null', () => {
      const rule = makeRule({ lastGenerated: null });
      expect(nextDueDate(rule)).toBe('2024-01-15');
    });

    it('returns next monthly occurrence after lastGenerated', () => {
      const rule = makeRule({ lastGenerated: '2024-01-15', frequency: 'monthly' });
      expect(nextDueDate(rule)).toBe('2024-02-15');
    });

    it('returns next weekly occurrence after lastGenerated', () => {
      const rule = makeRule({ lastGenerated: '2024-01-15', frequency: 'weekly' });
      expect(nextDueDate(rule)).toBe('2024-01-22');
    });

    it('returns next yearly occurrence after lastGenerated', () => {
      const rule = makeRule({ lastGenerated: '2024-01-15', frequency: 'yearly' });
      expect(nextDueDate(rule)).toBe('2025-01-15');
    });
  });

  describe('generateDueOccurrences', () => {
    it('generates monthly occurrences up to today', () => {
      const rule = makeRule({ startDate: '2024-01-15', frequency: 'monthly' });
      const today = '2024-04-20';
      const result = generateDueOccurrences([rule], [], today);
      expect(result.transactions).toHaveLength(4); // Jan, Feb, Mar, Apr
      expect(result.transactions.map((t) => t.date)).toEqual([
        '2024-01-15',
        '2024-02-15',
        '2024-03-15',
        '2024-04-15',
      ]);
    });

    it('skips already generated transactions', () => {
      const rule = makeRule({ startDate: '2024-01-15', frequency: 'monthly', lastGenerated: '2024-02-15' });
      const existing = [makeTx({ date: '2024-01-15' }), makeTx({ date: '2024-02-15' })];
      const today = '2024-04-20';
      const result = generateDueOccurrences([rule], existing, today);
      expect(result.transactions).toHaveLength(2); // Mar, Apr
      expect(result.transactions.map((t) => t.date)).toEqual(['2024-03-15', '2024-04-15']);
    });

    it('does not generate future occurrences', () => {
      const rule = makeRule({ startDate: '2024-01-15', frequency: 'monthly' });
      const today = '2024-02-10'; // before Feb 15
      const result = generateDueOccurrences([rule], [], today);
      expect(result.transactions).toHaveLength(1); // only Jan
      expect(result.transactions[0].date).toBe('2024-01-15');
    });

    it('respects active flag', () => {
      const rule = makeRule({ active: false, startDate: '2024-01-15' });
      const result = generateDueOccurrences([rule], [], '2024-04-20');
      expect(result.transactions).toHaveLength(0);
    });

    it('updates lastGenerated on rules', () => {
      const rule = makeRule({ startDate: '2024-01-15', frequency: 'monthly' });
      const today = '2024-04-20';
      const result = generateDueOccurrences([rule], [], today);
      expect(result.updatedRules).toHaveLength(1);
      expect(result.updatedRules[0].lastGenerated).toBe('2024-04-15');
    });

    it('handles weekly frequency correctly', () => {
      const rule = makeRule({ startDate: '2024-01-15', frequency: 'weekly' });
      const today = '2024-02-01'; // ~2.5 weeks
      const result = generateDueOccurrences([rule], [], today);
      expect(result.transactions.length).toBeGreaterThanOrEqual(2);
      expect(result.transactions[0].date).toBe('2024-01-15');
    });

    it('handles yearly frequency correctly', () => {
      const rule = makeRule({ startDate: '2024-01-15', frequency: 'yearly' });
      const today = '2026-06-01';
      const result = generateDueOccurrences([rule], [], today);
      expect(result.transactions).toHaveLength(3); // 2024, 2025, 2026
      expect(result.transactions.map((t) => t.date)).toEqual([
        '2024-01-15',
        '2025-01-15',
        '2026-01-15',
      ]);
    });
  });
});