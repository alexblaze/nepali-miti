import { describe, expect, it } from 'vitest';
import gazette from './fixtures/gazette-2083-weekdays.json';
import { daysInBsMonth, getWeekday, toAd } from '../src';

// Independent check of BS 2083 against the government's own holiday notice.
describe('BS 2083 against the Nepal Gazette holiday notice', () => {
  it('every Saturday listed in the gazette is a Saturday, and no Saturday is missing', () => {
    for (const [month, days] of Object.entries(gazette.saturdays)) {
      const m = Number(month);
      const saturdays: number[] = [];
      for (let d = 1; d <= daysInBsMonth(2083, m); d++)
        if (getWeekday({ year: 2083, month: m, day: d }) === 6) saturdays.push(d);
      expect(saturdays, `month ${m}`).toEqual(days);
    }
  });

  it.each(Object.entries(gazette.weekdays))('%s falls on weekday %i', (bs, weekday) => {
    expect(getWeekday(bs)).toBe(weekday);
  });

  it.each(Object.entries(gazette.adAnchors))('%s is %s (dates fixed by the Gregorian calendar)', (bs, ad) => {
    const d = toAd(bs);
    expect(`${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`).toBe(ad);
  });
});
