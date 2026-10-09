import {
  toISODate,
  parseDisplayDate,
  todayISO,
  monthKeyOf,
  monthKeyOfDate,
  monthLabel,
  monthShortLabel,
  shiftMonth,
  prevMonthKey,
  nextMonthKey,
  monthStart,
  monthEnd,
  formatDayLabel,
  formatShortDate,
  formatFullDate,
  groupDatesDescending,
  monthWindow,
} from '../dates';

describe('dates.ts', () => {
  describe('toISODate', () => {
    it('formats date as yyyy-MM-dd', () => {
      expect(toISODate(new Date('2024-01-15'))).toBe('2024-01-15');
      expect(toISODate(new Date('2024-12-31'))).toBe('2024-12-31');
    });
  });

  describe('parseDisplayDate', () => {
    it('parses ISO date string', () => {
      const date = parseDisplayDate('2024-01-15');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
    });
  });

  describe('todayISO', () => {
    it('returns today in ISO format', () => {
      const today = todayISO();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('monthKeyOf', () => {
    it('extracts yyyy-MM from ISO date', () => {
      expect(monthKeyOf('2024-01-15')).toBe('2024-01');
      expect(monthKeyOf('2024-12-31')).toBe('2024-12');
    });
  });

  describe('monthKeyOfDate', () => {
    it('extracts yyyy-MM from Date', () => {
      expect(monthKeyOfDate(new Date('2024-01-15'))).toBe('2024-01');
    });
  });

  describe('monthLabel', () => {
    it('formats month key as full month name', () => {
      expect(monthLabel('2024-01')).toBe('January 2024');
      expect(monthLabel('2024-12')).toBe('December 2024');
    });
  });

  describe('monthShortLabel', () => {
    it('formats month key as short month name', () => {
      expect(monthShortLabel('2024-01')).toBe('Jan');
      expect(monthShortLabel('2024-12')).toBe('Dec');
    });
  });

  describe('shiftMonth', () => {
    it('shifts month forward and backward', () => {
      expect(shiftMonth('2024-01', 1)).toBe('2024-02');
      expect(shiftMonth('2024-01', -1)).toBe('2023-12');
      expect(shiftMonth('2024-12', 1)).toBe('2025-01');
      expect(shiftMonth('2024-01', 12)).toBe('2025-01');
    });
  });

  describe('prevMonthKey / nextMonthKey', () => {
    it('returns previous/next month', () => {
      expect(prevMonthKey('2024-06')).toBe('2024-05');
      expect(nextMonthKey('2024-06')).toBe('2024-07');
    });
  });

  describe('monthStart / monthEnd', () => {
    it('returns first and last day of month', () => {
      const start = monthStart('2024-02');
      const end = monthEnd('2024-02');
      expect(start.getDate()).toBe(1);
      expect(end.getDate()).toBe(29); // 2024 is leap year
    });

    it('handles non-leap year February', () => {
      const end = monthEnd('2023-02');
      expect(end.getDate()).toBe(28);
    });
  });

  describe('formatDayLabel', () => {
    it('returns "Today" for today', () => {
      expect(formatDayLabel(todayISO())).toBe('Today');
    });

    it('returns "Yesterday" for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(formatDayLabel(toISODate(yesterday))).toBe('Yesterday');
    });

    it('returns formatted date for other days', () => {
      expect(formatDayLabel('2024-01-15')).toMatch(/^\d{2} \w{3} \d{4}$/);
    });
  });

  describe('formatShortDate', () => {
    it('returns "d MMM" format', () => {
      expect(formatShortDate('2024-01-15')).toBe('15 Jan');
      expect(formatShortDate('2024-12-01')).toBe('1 Dec');
    });
  });

  describe('formatFullDate', () => {
    it('returns full weekday, day, month, year', () => {
      expect(formatFullDate('2024-01-15')).toMatch(/^\w+, \d{1,2} \w+ \d{4}$/);
    });
  });

  describe('groupDatesDescending', () => {
    it('groups items by date, newest first', () => {
      const items = [
        { id: '1', date: '2024-01-15', value: 'a' },
        { id: '2', date: '2024-01-15', value: 'b' },
        { id: '3', date: '2024-01-10', value: 'c' },
        { id: '4', date: '2024-01-20', value: 'd' },
      ];
      const grouped = groupDatesDescending(items);
      expect(grouped).toHaveLength(3);
      expect(grouped[0].date).toBe('2024-01-20');
      expect(grouped[0].items).toHaveLength(1);
      expect(grouped[1].date).toBe('2024-01-15');
      expect(grouped[1].items).toHaveLength(2);
      expect(grouped[2].date).toBe('2024-01-10');
      expect(grouped[2].items).toHaveLength(1);
    });
  });

  describe('monthWindow', () => {
    it('returns last N months ending at endKey', () => {
      const window = monthWindow('2024-06', 6);
      expect(window).toEqual([
        '2024-01',
        '2024-02',
        '2024-03',
        '2024-04',
        '2024-05',
        '2024-06',
      ]);
    });

    it('handles year boundaries', () => {
      const window = monthWindow('2024-02', 4);
      expect(window).toEqual([
        '2023-11',
        '2023-12',
        '2024-01',
        '2024-02',
      ]);
    });
  });
});