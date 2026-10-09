import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
} from 'date-fns';

export const toISODate = (date: Date): string => format(date, 'yyyy-MM-dd');

export const parseDisplayDate = (isoDate: string): Date => parseISO(isoDate);

export const todayISO = (): string => toISODate(new Date());

export const monthKeyOf = (isoDate: string): string => format(parseISO(isoDate), 'yyyy-MM');

export const monthKeyOfDate = (date: Date): string => format(date, 'yyyy-MM');

export const monthLabel = (monthKey: string): string => {
  const [year, month] = monthKey.split('-').map(Number);
  return format(new Date(year, month - 1, 1), 'MMMM yyyy');
};

export const monthShortLabel = (monthKey: string): string => {
  const [year, month] = monthKey.split('-').map(Number);
  return format(new Date(year, month - 1, 1), 'MMM');
};

export const shiftMonth = (monthKey: string, delta: number): string => {
  const [year, month] = monthKey.split('-').map(Number);
  return format(addMonths(new Date(year, month - 1, 1), delta), 'yyyy-MM');
};

export const prevMonthKey = (monthKey: string) => shiftMonth(monthKey, -1);
export const nextMonthKey = (monthKey: string) => shiftMonth(monthKey, 1);

export const monthStart = (monthKey: string): Date => {
  const [year, month] = monthKey.split('-').map(Number);
  return startOfMonth(new Date(year, month - 1, 1));
};

export const monthEnd = (monthKey: string): Date => {
  const [year, month] = monthKey.split('-').map(Number);
  return endOfMonth(new Date(year, month - 1, 1));
};

/** "Today" / "Yesterday" / "12 Sep 2026" */
export function formatDayLabel(isoDate: string): string {
  const date = parseISO(isoDate);
  const now = new Date();
  if (isSameDay(date, now)) return 'Today';
  if (isSameDay(date, addDays(now, -1))) return 'Yesterday';
  return format(date, 'dd MMM yyyy');
}

/** "3 Oct" style short label */
export function formatShortDate(isoDate: string): string {
  return format(parseISO(isoDate), 'd MMM');
}

export function formatFullDate(isoDate: string): string {
  return format(parseISO(isoDate), 'EEEE, d MMMM yyyy');
}

/** Group transactions into date sections, newest first. */
export function groupDatesDescending<T extends { date: string }>(items: T[]): {
  date: string;
  label: string;
  items: T[];
}[] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const bucket = map.get(item.date);
    if (bucket) bucket.push(item);
    else map.set(item.date, [item]);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, bucket]) => ({ date, label: formatDayLabel(date), items: bucket }));
}

/** The last `count` month keys ending at `endKey` (inclusive), oldest first. */
export function monthWindow(endKey: string, count: number): string[] {
  const keys: string[] = [];
  let cursor = endKey;
  for (let i = 0; i < count; i += 1) {
    keys.unshift(cursor);
    cursor = prevMonthKey(cursor);
  }
  return keys;
}
