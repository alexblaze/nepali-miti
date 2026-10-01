import { describe, expect, it } from 'vitest';
import { format, getMonthName, getWeekdayName, parse, toEnglishDigits, toNepaliDigits } from '../src';

describe('format', () => {
  const d = { year: 2083, month: 6, day: 5 };

  it('defaults to YYYY-MM-DD', () => {
    expect(format(d)).toBe('2083-06-05');
  });

  it('supports every token in English', () => {
    expect(format(d, 'YYYY YY MMMM MMM MM M DD D dddd ddd d')).toBe('2083 83 Asoj Aso 06 6 05 5 Monday Mon 1');
  });

  it('supports Nepali names and Devanagari digits', () => {
    expect(format('2083-06-15', 'YYYY MMMM D, dddd', { locale: 'ne' })).toBe('२०८३ असोज १५, बिहीबार');
    expect(format(d, 'YY MMM MM DD ddd d', { locale: 'ne' })).toBe('८३ असोज ०६ ०५ सोम १');
  });

  it('keeps [bracketed] text literally', () => {
    expect(format(d, '[Miti: ]YYYY [MM]')).toBe('Miti: 2083 MM');
  });

  it('validates input and locale', () => {
    expect(() => format('2083-06-32')).toThrow(RangeError);
    // @ts-expect-error runtime check
    expect(() => format(d, 'YYYY', { locale: 'fr' })).toThrow(TypeError);
  });
});

describe('parse', () => {
  it('parses the default pattern', () => {
    expect(parse('2083-06-15')).toEqual({ year: 2083, month: 6, day: 15 });
  });

  it('parses custom patterns, Devanagari digits and month names', () => {
    expect(parse('15/06/2083', 'DD/MM/YYYY')).toEqual({ year: 2083, month: 6, day: 15 });
    expect(parse('1 kartik 2083', 'D MMMM YYYY')).toEqual({ year: 2083, month: 7, day: 1 });
    expect(parse('१५ असोज २०८३', 'D MMMM YYYY')).toEqual({ year: 2083, month: 6, day: 15 });
    expect(parse('Miti 2083.6.5', '[Miti] YYYY.M.D')).toEqual({ year: 2083, month: 6, day: 5 });
  });

  it('round-trips with format', () => {
    for (const pattern of ['YYYY-MM-DD', 'D MMMM YYYY', 'DD/MM/YYYY']) {
      for (const locale of ['en', 'ne'] as const) {
        const text = format('2083-03-32', pattern, { locale });
        expect(parse(text, pattern)).toEqual({ year: 2083, month: 3, day: 32 });
      }
    }
  });

  it('throws on mismatches and impossible dates', () => {
    expect(() => parse('2083-6-15')).toThrow(TypeError); // MM requires two digits
    expect(() => parse('hello')).toThrow(TypeError);
    expect(() => parse('2083-06-32')).toThrow(RangeError);
    expect(() => parse('2083-06', 'YYYY-MM')).toThrow(/year, a month and a day/);
    // @ts-expect-error runtime check
    expect(() => parse(20830615)).toThrow(TypeError);
  });
});

describe('digits and names', () => {
  it('converts digits both ways', () => {
    expect(toNepaliDigits(2083)).toBe('२०८३');
    expect(toNepaliDigits('Rs. 1,250')).toBe('Rs. १,२५०');
    expect(toEnglishDigits('२०८३-०६-१५')).toBe('2083-06-15');
  });

  it('returns month and weekday names', () => {
    expect(getMonthName(1)).toBe('Baisakh');
    expect(getMonthName(12, { locale: 'ne' })).toBe('चैत');
    expect(getMonthName(7, { short: true })).toBe('Kar');
    expect(getWeekdayName(0)).toBe('Sunday');
    expect(getWeekdayName(6, { locale: 'ne', short: true })).toBe('शनि');
    expect(() => getMonthName(13)).toThrow(RangeError);
    expect(() => getMonthName(1.5)).toThrow(RangeError);
    expect(() => getWeekdayName(7)).toThrow(RangeError);
  });
});
