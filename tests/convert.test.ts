import { describe, expect, it } from 'vitest';
import { daysInBsMonth, daysInBsYear, getSupportedRange, isValidBs, toAd, toBs, toDate, today } from '../src';

describe('toBs', () => {
  it('accepts a string, a plain object and a Date', () => {
    const expected = { year: 2083, month: 6, day: 15 };
    expect(toBs('2026-10-01')).toEqual(expected);
    expect(toBs({ year: 2026, month: 10, day: 1 })).toEqual(expected);
    expect(toBs(new Date(2026, 9, 1))).toEqual(expected);
  });

  it('accepts / and . separators and unpadded parts', () => {
    expect(toBs('2026/10/1')).toEqual({ year: 2083, month: 6, day: 15 });
    expect(toBs('2026.10.01')).toEqual({ year: 2083, month: 6, day: 15 });
  });

  it('handles AD leap days', () => {
    expect(toAd(toBs('2024-02-29'))).toEqual({ year: 2024, month: 2, day: 29 });
  });

  it('rejects invalid AD dates', () => {
    expect(() => toBs('2026-02-30')).toThrow(RangeError);
    expect(() => toBs('2025-02-29')).toThrow(RangeError);
    expect(() => toBs('2026-13-01')).toThrow(RangeError);
    expect(() => toBs('not a date')).toThrow(TypeError);
    expect(() => toBs(new Date('nope'))).toThrow(TypeError);
    // @ts-expect-error runtime check
    expect(() => toBs(42)).toThrow(TypeError);
  });

  it('rejects dates outside the supported range', () => {
    expect(() => toBs('1943-04-13')).toThrow(/outside the supported range/);
    expect(toBs('1943-04-14')).toEqual({ year: 2000, month: 1, day: 1 });
    const max = getSupportedRange().max;
    const lastAd = toAd(max);
    expect(toBs(lastAd)).toEqual(max);
    const next = new Date(Date.UTC(lastAd.year, lastAd.month - 1, lastAd.day + 1));
    expect(() => toBs(next, { timeZone: 'utc' })).toThrow(RangeError);
  });

  it('reads the calendar day in the requested timezone', () => {
    // 2026-10-01T20:00Z is still Oct 1 in UTC but already Oct 2 in Nepal (UTC+05:45).
    const instant = new Date('2026-10-01T20:00:00Z');
    expect(toBs(instant, { timeZone: 'utc' })).toEqual({ year: 2083, month: 6, day: 15 });
    expect(toBs(instant, { timeZone: 'nepal' })).toEqual({ year: 2083, month: 6, day: 16 });
    // 18:14Z + 5:45 = 23:59 the same day; 18:15Z = midnight the next day.
    expect(toBs(new Date('2026-10-01T18:14:59Z'), { timeZone: 'nepal' }).day).toBe(15);
    expect(toBs(new Date('2026-10-01T18:15:00Z'), { timeZone: 'nepal' }).day).toBe(16);
  });

  it('uses UTC+05:30 for Nepal time before 1986', () => {
    // 1980-01-01T18:20Z: +05:30 → 23:50 Jan 1; +05:45 would give Jan 2.
    const bs = toBs(new Date('1980-01-01T18:20:00Z'), { timeZone: 'nepal' });
    expect(toAd(bs)).toEqual({ year: 1980, month: 1, day: 1 });
  });

  it('rejects unknown timeZone values', () => {
    // @ts-expect-error runtime check
    expect(() => toBs(new Date(), { timeZone: 'mars' })).toThrow(TypeError);
  });
});

describe('toAd', () => {
  it('accepts Devanagari digits', () => {
    expect(toAd('२०८३-०६-१५')).toEqual({ year: 2026, month: 10, day: 1 });
  });

  it('rejects invalid BS dates', () => {
    expect(() => toAd('2083-06-32')).toThrow(RangeError); // Asoj 2083 has 31 days
    expect(() => toAd('2083-13-01')).toThrow(RangeError);
    expect(() => toAd('2083-00-01')).toThrow(RangeError);
    expect(() => toAd({ year: 2083, month: 1.5, day: 1 })).toThrow(RangeError);
    expect(() => toAd('1999-12-30')).toThrow(/outside the supported range/);
  });

  it('round-trips every day in the supported range', () => {
    const { min, max } = getSupportedRange();
    let ad = toAd(min);
    let count = 0;
    let utc = Date.UTC(ad.year, ad.month - 1, ad.day);
    for (;;) {
      const bs = toBs(ad);
      expect(toAd(bs)).toEqual(ad);
      count++;
      if (bs.year === max.year && bs.month === max.month && bs.day === max.day) break;
      utc += 86_400_000;
      const d = new Date(utc);
      ad = { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
    }
    let expectedDays = 0;
    for (let y = min.year; y <= max.year; y++) expectedDays += daysInBsYear(y);
    expect(count).toBe(expectedDays);
  });
});

describe('toDate', () => {
  it('returns local midnight by default', () => {
    const d = toDate('2083-06-15');
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2026, 9, 1, 0, 0]);
  });
  it('returns UTC midnight', () => {
    expect(toDate('2083-06-15', { timeZone: 'utc' }).toISOString()).toBe('2026-10-01T00:00:00.000Z');
  });
  it('returns Nepal midnight', () => {
    expect(toDate('2083-06-15', { timeZone: 'nepal' }).toISOString()).toBe('2026-09-30T18:15:00.000Z');
    expect(toDate({ year: 2036, month: 1, day: 1 }, { timeZone: 'nepal' }).toISOString()).toBe(
      '1979-04-13T18:30:00.000Z',
    );
  });
  it('round-trips with toBs in each mode', () => {
    for (const timeZone of ['local', 'utc', 'nepal'] as const) {
      expect(toBs(toDate('2083-07-01', { timeZone }), { timeZone })).toEqual({ year: 2083, month: 7, day: 1 });
    }
  });
  it('rejects unknown timeZone values', () => {
    // @ts-expect-error runtime check
    expect(() => toDate('2083-07-01', { timeZone: 'x' })).toThrow(TypeError);
  });
});

describe('today', () => {
  it('matches toBs(new Date())', () => {
    expect(today({ timeZone: 'utc' })).toEqual(toBs(new Date(), { timeZone: 'utc' }));
    expect(isValidBs(today().year, today().month, today().day)).toBe(true);
  });
});

describe('validation helpers', () => {
  it('isValidBs never throws', () => {
    expect(isValidBs(2083, 3, 32)).toBe(true); // Asar 2083 has 32 days
    expect(isValidBs(2083, 6, 32)).toBe(false);
    expect(isValidBs(2083, 0, 1)).toBe(false);
    expect(isValidBs(1800, 1, 1)).toBe(false);
    expect(isValidBs(Number.NaN, 1, 1)).toBe(false);
  });

  it('daysInBsMonth and daysInBsYear', () => {
    expect(daysInBsMonth(2083, 6)).toBe(31);
    expect(daysInBsMonth(2083, 3)).toBe(32);
    expect(() => daysInBsMonth(2083, 13)).toThrow(RangeError);
    expect(() => daysInBsMonth(3000, 1)).toThrow(RangeError);
    expect(daysInBsYear(2083)).toBe(365);
    expect(() => daysInBsYear(3000)).toThrow(RangeError);
    for (let y = 2000; y <= 2090; y++) expect([365, 366]).toContain(daysInBsYear(y));
  });
});
