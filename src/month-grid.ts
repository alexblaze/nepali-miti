import { weekdayOfDayNumber } from './arithmetic';
import { getSupportedRange } from './calendar';
import { bsToDayNumber, daysInBsMonth, dayNumberToBs } from './convert';
import { dayNumberToAd } from './gregorian';
import type { AdDate, BsDate } from './types';

export interface MonthGridDay {
  bs: BsDate;
  ad: AdDate;
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number;
  /** `false` for leading/trailing days that belong to the previous or next month. */
  inMonth: boolean;
}

export interface MonthGridOptions {
  /** First column of each week: 0 = Sunday (default, as on Nepali calendars) … 6 = Saturday. */
  weekStartsOn?: number;
  /**
   * Pad with days from the previous and next months so every week has 7 cells (default `true`).
   * Padding days outside the supported range are returned as `null`.
   */
  fillWeeks?: boolean;
}

/**
 * Build the weeks of a BS month — the data a calendar or date picker needs to render a month view.
 *
 * @example
 * const weeks = getMonthGrid(2083, 6);
 * weeks[0][4] // { bs: { year: 2083, month: 6, day: 1 }, ad: {...}, weekday: 4, inMonth: true }
 */
export function getMonthGrid(year: number, month: number, options: MonthGridOptions = {}): (MonthGridDay | null)[][] {
  const weekStartsOn = options.weekStartsOn ?? 0;
  if (!Number.isInteger(weekStartsOn) || weekStartsOn < 0 || weekStartsOn > 6) {
    throw new RangeError(`getMonthGrid: weekStartsOn must be an integer from 0 to 6, got ${weekStartsOn}`);
  }
  const fillWeeks = options.fillWeeks ?? true;
  const length = daysInBsMonth(year, month);
  const first = bsToDayNumber({ year, month, day: 1 });
  const lead = (weekdayOfDayNumber(first) - weekStartsOn + 7) % 7;
  const cells = Math.ceil((lead + length) / 7) * 7;

  const range = getSupportedRange();
  const min = bsToDayNumber(range.min);
  const max = bsToDayNumber(range.max);

  const weeks: (MonthGridDay | null)[][] = [];
  for (let i = 0; i < cells; i++) {
    const n = first - lead + i;
    const inMonth = n >= first && n < first + length;
    let cell: MonthGridDay | null = null;
    if (inMonth || (fillWeeks && n >= min && n <= max)) {
      cell = { bs: dayNumberToBs(n), ad: dayNumberToAd(n), weekday: weekdayOfDayNumber(n), inMonth };
    }
    if (i % 7 === 0) weeks.push([]);
    weeks[weeks.length - 1]!.push(cell);
  }
  return weeks;
}
