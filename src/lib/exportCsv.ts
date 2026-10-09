import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { buildTransactionsCsv } from '@/lib/csv';
import { todayISO } from '@/lib/dates';
import { Transaction } from '@/types';

export async function shareTransactionsCsv(
  transactions: Transaction[],
  currency = 'INR',
): Promise<void> {
  const csv = buildTransactionsCsv(transactions, currency);
  const name = `ledger-transactions-${todayISO()}.csv`;
  const file = new FileSystem.File(FileSystem.Paths.cache, name);

  if (file.exists) file.delete();
  file.create();
  file.write(csv);

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/csv',
    dialogTitle: 'Export transactions',
    UTI: 'public.comma-separated-values-text',
  });
}
