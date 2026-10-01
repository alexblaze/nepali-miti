import { describe, expect, it } from 'vitest';
import { addDays, addMonths, addYears, compareBs, differenceInDays, getWeekday, isSameBsDay } from '../src';

describe('getWeekday', () => {
  it('returns 0 = Sunday … 6 = Saturday', () => {
    expect(getWeekday('2083-06-15')).toBe(4); // Thu 2026-10-01
    expect(getWeekday('2083-07-01')).toBe(0); // Sun 2026-10-18
    expect(getWeekday('2000-01-01')).toBe(3); // Wed 1943-04-14
  });
});

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2083-06-31', 1)).toEqual({ year: 2083, month: 7, day: 1 });
    expect(addDays('2083-12-30', 1)).toEqual({ year: 2084, month: 1, day: 1 });
    expect(addDays('2084-01-01', -1)).toEqual({ year: 2083, month: 12, day: 30 });
    expect(addDays('2083-06-15', 0)).toEqual({ year: 2083, month: 6, day: 15 });
  });
  it('rejects non-integers and out-of-range results', () => {
    expect(() => addDays('2083-06-15', 1.5)).toThrow(TypeError);
    expect(() => addDays('2000-01-01', -1)).toThrow(RangeError);
  });
});

describe('addMonths / addYears', () => {
  it('clamps the day to the target month length', () => {
    expect(addMonths('2083-03-32', 1)).toEqual({ year: 2083, month: 4, day: 31 });
    expect(addMonths('2083-12-15', 1)).toEqual({ year: 2084, month: 1, day: 15 });
    expect(addMonths('2083-01-15', -1)).toEqual({ year: 2082, month: 12, day: 15 });
    expect(addMonths('2083-01-15', -13)).toEqual({ year: 2081, month: 12, day: 15 });
    expect(addYears('2083-03-32', 1)).toEqual({ year: 2084, month: 3, day: 32 });
    expect(addYears('2083-03-32', -2)).toEqual({ year: 2081, month: 3, day: 31 }); // Asar 2081 has 31 days
  });
  it('rejects non-integers and out-of-range results', () => {
    expect(() => addMonths('2083-01-01', 0.5)).toThrow(TypeError);
    expect(() => addYears('2083-01-01', 0.5)).toThrow(TypeError);
    expect(() => addYears('2083-01-01', 100)).toThrow(RangeError);
  });
});

describe('comparison', () => {
  it('differenceInDays', () => {
    expect(differenceInDays('2083-06-15', '2083-07-01')).toBe(17);
    expect(differenceInDays('2083-07-01', '2083-06-15')).toBe(-17);
    expect(differenceInDays('2083-01-01', '2084-01-01')).toBe(365);
  });
  it('compareBs sorts chronologically', () => {
    const dates = ['2083-07-01', '2082-12-30', '2083-06-15'];
    expect([...dates].sort(compareBs)).toEqual(['2082-12-30', '2083-06-15', '2083-07-01']);
  });
  it('isSameBsDay accepts mixed inputs', () => {
    expect(isSameBsDay('2083-06-15', { year: 2083, month: 6, day: 15 })).toBe(true);
    expect(isSameBsDay('2083-06-15', '2083-06-16')).toBe(false);
  });
});
