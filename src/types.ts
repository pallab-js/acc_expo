export type TxType = 'income' | 'expense';

export type Frequency = 'weekly' | 'monthly' | 'yearly';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  kind: TxType;
}

export interface Transaction {
  id: string;
  type: TxType;
  /** amount in minor units (paise), always a positive integer */
  amount: number;
  categoryId: string;
  /** ISO date, yyyy-MM-dd */
  date: string;
  note?: string;
  recurringId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  /** limit in minor units */
  amount: number;
  /** month key, yyyy-MM */
  month: string;
}

export interface RecurringRule {
  id: string;
  type: TxType;
  amount: number;
  categoryId: string;
  frequency: Frequency;
  /** ISO date, yyyy-MM-dd — anchors the occurrence sequence */
  startDate: string;
  note?: string;
  active: boolean;
  /** last generated occurrence date, yyyy-MM-dd */
  lastGenerated: string | null;
  createdAt: string;
}

export interface Settings {
  currency: string;
  seeded: boolean;
}

export interface TransactionInput {
  type: TxType;
  amount: number;
  categoryId: string;
  date: string;
  note?: string;
  recurringId?: string;
}
