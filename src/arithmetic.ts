import { getYearEntry } from './calendar';
import { bsToDayNumber, dayNumberToBs, normalizeBs } from './convert';
import type { BsDate, BsInput } from './types';

/** Weekday (0 = Sunday) of a day number. 1970-01-01 (day 0) was a Thursday. @internal */
export function weekdayOfDayNumber(n: number): number {
  return (((n + 4) % 7) + 7) % 7;
}

/** Day of the week for a BS date: 0 = Sunday … 6 = Saturday. */
export function getWeekday(input: BsInput): number {
  return weekdayOfDayNumber(bsToDayNumber(normalizeBs(input)));
}

/** Add (or subtract, with a negative number) whole days to a BS date. */
export function addDays(input: BsInput, days: number): BsDate {
  if (!Number.isInteger(days)) throw new TypeError(`addDays: days must be an integer, got ${days}`);
  return dayNumberToBs(bsToDayNumber(normalizeBs(input)) + days);
}

/**
 * Add (or subtract) BS months. If the target month is shorter, the day is clamped to its last day
 * (e.g. 32 Asar + 1 month → 31 Shrawan when Shrawan has 31 days).
 */
export function addMonths(input: BsInput, months: number): BsDate {
  if (!Number.isInteger(months)) throw new TypeError(`addMonths: months must be an integer, got ${months}`);
  const bs = normalizeBs(input);
  const total = bs.year * 12 + (bs.month - 1) + months;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  const entry = getYearEntry(year);
  if (!entry) throw new RangeError(`addMonths: BS year ${year} is outside the supported range`);
  return { year, month, day: Math.min(bs.day, entry.months[month - 1]!) };
}

/** Add (or subtract) BS years, clamping the day like {@link addMonths}. */
export function addYears(input: BsInput, years: number): BsDate {
  if (!Number.isInteger(years)) throw new TypeError(`addYears: years must be an integer, got ${years}`);
  return addMonths(input, years * 12);
}

/** Whole days from `a` to `b` (`b - a`). Positive when `b` is later. */
export function differenceInDays(a: BsInput, b: BsInput): number {
  return bsToDayNumber(normalizeBs(b)) - bsToDayNumber(normalizeBs(a));
}

/** Sort comparator: negative if `a` is earlier than `b`, positive if later, `0` if the same day. */
export function compareBs(a: BsInput, b: BsInput): number {
  return Math.sign(bsToDayNumber(normalizeBs(a)) - bsToDayNumber(normalizeBs(b)));
}

/** `true` if both inputs are the same BS day. */
export function isSameBsDay(a: BsInput, b: BsInput): boolean {
  return compareBs(a, b) === 0;
}
