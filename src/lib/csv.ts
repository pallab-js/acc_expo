import { getCategory } from '@/lib/categories';
import { Transaction } from '@/types';

function escapeCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function buildTransactionsCsv(transactions: Transaction[], currency = 'INR'): string {
  const header = ['Date', 'Type', 'Category', 'Amount', 'Currency', 'Note'];
  const rows = [...transactions]
    .sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0))
    .map((tx) => [
      tx.date,
      tx.type,
      getCategory(tx.categoryId).name,
      (tx.amount / 100).toFixed(2),
      currency,
      tx.note ?? '',
    ]);
  return [header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
}
