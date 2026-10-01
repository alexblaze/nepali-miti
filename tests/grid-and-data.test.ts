import { afterEach, describe, expect, it } from 'vitest';
import {
  daysInBsMonth,
  getMonthGrid,
  getSupportedRange,
  getYearStatus,
  registerYear,
  resetCalendarData,
  toAd,
  toBs,
} from '../src';

describe('getMonthGrid', () => {
  it('lays out Asoj 2083 starting on Thursday', () => {
    const weeks = getMonthGrid(2083, 6);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    const first = weeks[0]![4]!;
    expect(first).toEqual({
      bs: { year: 2083, month: 6, day: 1 },
      ad: { year: 2026, month: 9, day: 17 },
      weekday: 4,
      inMonth: true,
    });
    expect(weeks[0]![0]!.inMonth).toBe(false);
    expect(weeks[0]![0]!.bs).toEqual({ year: 2083, month: 5, day: 28 });
    const days = weeks.flat().filter((c) => c?.inMonth);
    expect(days).toHaveLength(31);
    expect(days[days.length - 1]!.bs.day).toBe(31);
  });

  it('respects weekStartsOn', () => {
    const weeks = getMonthGrid(2083, 6, { weekStartsOn: 1 });
    expect(weeks[0]![3]!.bs.day).toBe(1);
    expect(weeks.flat().every((c, i) => c === null || c.weekday === (i + 1) % 7)).toBe(true);
    expect(() => getMonthGrid(2083, 6, { weekStartsOn: 7 })).toThrow(RangeError);
  });

  it('returns null padding when fillWeeks is false or outside the range', () => {
    const weeks = getMonthGrid(2083, 6, { fillWeeks: false });
    expect(weeks[0]![0]).toBeNull();
    const firstMonth = getMonthGrid(2000, 1); // starts Wednesday; no data before it
    expect(firstMonth[0]![0]).toBeNull();
    expect(firstMonth[0]![3]!.bs).toEqual({ year: 2000, month: 1, day: 1 });
  });
});

describe('registerYear', () => {
  afterEach(() => resetCalendarData());

  it('appends a new year', () => {
    const lengths = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    registerYear(2091, lengths, { status: 'verified' });
    expect(getSupportedRange().max).toEqual({ year: 2091, month: 12, day: 30 });
    expect(getYearStatus(2091)).toBe('verified');
    expect(toBs(toAd('2091-12-30'))).toEqual({ year: 2091, month: 12, day: 30 });
  });

  it('replaces a year and shifts later years', () => {
    const before = toAd('2085-01-01');
    // Move one day from Asoj to Kartik in 2084: Baisakh 2085 is unaffected (same total).
    registerYear(2084, [31, 31, 32, 31, 31, 29, 31, 30, 29, 30, 30, 30]);
    expect(daysInBsMonth(2084, 6)).toBe(29);
    expect(toAd('2085-01-01')).toEqual(before);
    // Make 2084 a 366-day year: everything after shifts by one day.
    registerYear(2084, [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 31]);
    expect(toAd('2085-01-01')).toEqual({ year: before.year, month: before.month, day: before.day + 1 });
    expect(getYearStatus(2084)).toBe('provisional');
  });

  it('validates input', () => {
    const ok = [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
    expect(() => registerYear(2092, ok)).toThrow(RangeError);
    expect(() => registerYear(1999, ok)).toThrow(RangeError);
    expect(() => registerYear(2084, ok.slice(1))).toThrow(TypeError);
    expect(() => registerYear(2084, [...ok.slice(1), 33])).toThrow(TypeError);
    expect(() => registerYear(2084, [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30])).toThrow(RangeError);
  });

  it('resetCalendarData restores bundled data', () => {
    registerYear(2091, [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30]);
    resetCalendarData();
    expect(getSupportedRange().max.year).toBe(2090);
  });
});
