import {
  formatMoney,
  formatMoneyCompact,
  formatSignedMoney,
  parseMoneyToMinor,
} from '../money';

describe('money.ts', () => {
  describe('formatMoney', () => {
    it('formats positive amounts', () => {
      expect(formatMoney(123450)).toMatch(/1,234.50/);
      expect(formatMoney(100000)).toMatch(/1,000.00/);
    });

    it('formats zero', () => {
      expect(formatMoney(0)).toMatch(/0.00/);
    });

    it('handles large amounts with Indian numbering', () => {
      const formatted = formatMoney(123456789);
      // Uses Indian grouping via Intl: ₹12,34,567.89
      expect(formatted).toMatch(/12,34,567.89/);
    });
  });

  describe('formatMoneyCompact', () => {
    it('formats crores', () => {
      // 10,000,000,000 minor = 100,000,000 rupees = 10 Cr
      expect(formatMoneyCompact(10000000000)).toMatch(/10Cr/);
      // 12,345,678,900 minor = 123,456,789 rupees = 12.3 Cr
      expect(formatMoneyCompact(12345678900)).toMatch(/12.3Cr/);
    });

    it('formats lakhs', () => {
      // 10,000,000 minor = 100,000 rupees = 1 L
      expect(formatMoneyCompact(10000000)).toMatch(/1L/);
      // 12,345,678 minor = 123,456.78 rupees = 1.2 L
      expect(formatMoneyCompact(12345678)).toMatch(/1.2L/);
    });

    it('formats thousands', () => {
      // 100,000 minor = 1,000 rupees = 1 k
      expect(formatMoneyCompact(100000)).toMatch(/1k/);
      // 123,456 minor = 1,234.56 rupees = 1.2 k
      expect(formatMoneyCompact(123456)).toMatch(/1.2k/);
    });

    it('formats small amounts', () => {
      expect(formatMoneyCompact(50000)).toMatch(/500/);
      expect(formatMoneyCompact(12345)).toMatch(/123/);
    });

    it('handles negative amounts', () => {
      expect(formatMoneyCompact(-10000000)).toMatch(/-\u20B91L/); // -₹1L
    });
  });

  describe('formatSignedMoney', () => {
    it('adds + for income', () => {
      expect(formatSignedMoney(100000, 'income')).toMatch(/^\+/);
    });

    it('adds - for expense', () => {
      expect(formatSignedMoney(100000, 'expense')).toMatch(/^\-/);
    });
  });

  describe('parseMoneyToMinor', () => {
    it('parses plain numbers', () => {
      expect(parseMoneyToMinor('1234.56')).toBe(123456);
      expect(parseMoneyToMinor('1000')).toBe(100000);
      expect(parseMoneyToMinor('0.50')).toBe(50);
    });

    it('parses with commas and currency symbols', () => {
      expect(parseMoneyToMinor('1,234.56')).toBe(123456);
      expect(parseMoneyToMinor('₹1,234.56')).toBe(123456);
      expect(parseMoneyToMinor('$1,234.56')).toBe(123456);
      expect(parseMoneyToMinor('€1 234.56')).toBe(123456);
    });

    it('parses zero', () => {
      expect(parseMoneyToMinor('0')).toBe(0);
      expect(parseMoneyToMinor('0.00')).toBe(0);
    });

    it('returns null for invalid input', () => {
      expect(parseMoneyToMinor('')).toBeNull();
      expect(parseMoneyToMinor('abc')).toBeNull();
      expect(parseMoneyToMinor('-100')).toBeNull(); // negative not allowed
      expect(parseMoneyToMinor('1.234')).toBeNull(); // more than 2 decimals
      expect(parseMoneyToMinor('1..23')).toBeNull();
    });

    it('rejects more than 2 decimal places', () => {
      expect(parseMoneyToMinor('1.234')).toBeNull();
      expect(parseMoneyToMinor('1.2345')).toBeNull();
    });
  });
});