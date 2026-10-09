const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string): Intl.NumberFormat | null {
  const cached = formatterCache.get(currency);
  if (cached) return cached;
  try {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    formatterCache.set(currency, formatter);
    return formatter;
  } catch {
    return null;
  }
}

function fallbackFormat(minor: number, currency: string): string {
  const negative = minor < 0;
  const abs = Math.abs(minor);
  const rupee = currency === 'INR' ? '₹' : '';
  const major = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, '0');
  const digits = String(major);
  let grouped: string;
  if (digits.length <= 3) {
    grouped = digits;
  } else {
    const last3 = digits.slice(-3);
    const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    grouped = `${rest},${last3}`;
  }
  return `${negative ? '-' : ''}${rupee}${grouped}.${frac}`;
}

/** Format an integer minor-unit amount, e.g. 1245050 -> "₹12,450.50" */
export function formatMoney(minor: number, currency = 'INR'): string {
  const formatter = getFormatter(currency);
  if (!formatter) return fallbackFormat(minor, currency);
  return formatter.format(minor / 100);
}

/** Compact format for charts/tooltips, e.g. 124505000 -> "₹12.5L" (input in minor units) */
export function formatMoneyCompact(minor: number, currency = 'INR'): string {
  const abs = Math.abs(minor);
  const sign = minor < 0 ? '-' : '';
  const symbol = currency === 'INR' ? '₹' : '';
  const scaled = (divisor: number): string =>
    `${sign}${symbol}${(abs / divisor).toFixed(1).replace(/\.0$/, '')}`;

  // thresholds in minor units: 1 crore = 1e9, 1 lakh = 1e7, ₹1,000 = 1e5
  if (abs >= 1_000_000_000) return `${scaled(1_000_000_000)}Cr`;
  if (abs >= 10_000_000) return `${scaled(10_000_000)}L`;
  if (abs >= 100_000) return `${scaled(100_000)}k`;
  return `${sign}${symbol}${Math.round(abs / 100)}`;
}

/** Signed display for lists, e.g. "+₹500.00" / "-₹250.00" */
export function formatSignedMoney(
  minor: number,
  type: 'income' | 'expense',
  currency = 'INR',
): string {
  const body = formatMoney(Math.abs(minor), currency);
  if (type === 'income') return `+${body}`;
  return `-${body}`;
}

/** Parse user input like "1,234.50" into minor units. Returns null when invalid. */
export function parseMoneyToMinor(input: string): number | null {
  const cleaned = input.replace(/[,₹$€£\s]/g, '');
  if (!cleaned || !/^\d*\.?\d{0,2}$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}
