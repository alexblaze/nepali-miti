import { describe, expect, it } from 'vitest';
import consensus from './fixtures/consensus-month-starts.json';
import hamro from './fixtures/hamropatro-month-starts.json';
import { getYearStatus, toAd, toBs } from '../src';

const iso = (d: { year: number; month: number; day: number }): string =>
  `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;

describe('accuracy against Hamro Patro (BS 2075–2086)', () => {
  const entries = Object.entries(hamro.monthStarts);
  it('has the expected number of reference months', () => {
    expect(entries.length).toBe(143);
  });
  it.each(entries)('BS %s → AD %s', (bs, ad) => {
    expect(iso(toAd(bs))).toBe(ad);
    expect(iso(toBs(ad))).toBe(bs);
  });
});

describe('accuracy against cross-library consensus (BS 2000–2082)', () => {
  const entries = Object.entries(consensus.monthStarts);
  it('covers every month of BS 2000–2082', () => {
    expect(entries.length).toBe(83 * 12);
  });
  it('matches every month start', () => {
    const mismatches = entries.filter(([bs, ad]) => iso(toAd(bs)) !== ad);
    expect(mismatches).toEqual([]);
  });
});

describe('well-known dates', () => {
  it.each([
    ['2000-01-01', '1943-04-14'], // first supported day
    ['2072-06-03', '2015-09-20'], // Constitution of Nepal promulgated
    ['2081-01-01', '2024-04-13'], // New Year 2081
    ['2082-01-01', '2025-04-14'], // New Year 2082
    ['2083-01-01', '2026-04-14'], // New Year 2083
    ['2083-06-15', '2026-10-01'],
    ['2083-06-31', '2026-10-17'], // Asoj 2083 has 31 days (other libraries get this wrong)
    ['2083-07-01', '2026-10-18'], // Kartik 1, 2083
  ])('BS %s = AD %s', (bs, ad) => {
    expect(iso(toAd(bs))).toBe(ad);
    expect(iso(toBs(ad))).toBe(bs);
  });
});

describe('data status', () => {
  it('marks published years as verified and future years as provisional', () => {
    expect(getYearStatus(2000)).toBe('verified');
    expect(getYearStatus(2083)).toBe('verified');
    expect(getYearStatus(2084)).toBe('provisional');
    expect(getYearStatus(2090)).toBe('provisional');
    expect(getYearStatus(1999)).toBeUndefined();
    expect(getYearStatus(2091)).toBeUndefined();
  });
});
