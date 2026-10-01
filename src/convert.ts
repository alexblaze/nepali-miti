import {
  firstDayNumber,
  getSupportedRange,
  getYearEntry,
  lastDayNumber,
  yearAt,
  yearIndexForDayNumber,
} from './calendar';
import { FIRST_YEAR } from './data';
import { adToDayNumber, dayNumberToAd, isValidAd } from './gregorian';
import { toEnglishDigits } from './locale';
import type { AdDate, AdInput, BsDate, BsInput, TimeZoneOptions } from './types';

const ISO_DATE = /^\s*(\d{1,4})[-/.](\d{1,2})[-/.](\d{1,2})\s*$/;
const MS_PER_MINUTE = 60_000;
/** 1986-01-01T00:00 Nepal time, when Nepal moved from UTC+05:30 to UTC+05:45. */
const NEPAL_OFFSET_CHANGE_MS = Date.UTC(1985, 11, 31, 18, 30);

function formatBs(d: BsDate): string {
  return `${d.year}-${d.month}-${d.day}`;
}

/** Calendar day of a `Date` instant in the requested timezone. @internal */
export function calendarDayOf(date: Date, options: TimeZoneOptions = {}): AdDate {
  const time = date.getTime();
  if (Number.isNaN(time)) throw new TypeError('Invalid Date');
  switch (options.timeZone ?? 'local') {
    case 'local':
      return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
    case 'utc':
      return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
    case 'nepal': {
      const offsetMinutes = time >= NEPAL_OFFSET_CHANGE_MS ? 345 : 330;
      const shifted = new Date(time + offsetMinutes * MS_PER_MINUTE);
      return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate() };
    }
    default:
      throw new TypeError(`Unknown timeZone option: ${String(options.timeZone)}`);
  }
}

function parseYmd(value: string, kind: 'AD' | 'BS'): { year: number; month: number; day: number } {
  const match = ISO_DATE.exec(toEnglishDigits(value));
  if (!match) throw new TypeError(`Expected a ${kind} date string like "YYYY-MM-DD", got "${value}"`);
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function isPlainDate(value: unknown): value is { year: unknown; month: unknown; day: unknown } {
  return typeof value === 'object' && value !== null && 'year' in value && 'month' in value && 'day' in value;
}

/** Normalize any AD input to a validated calendar date. @internal */
export function normalizeAd(input: AdInput, options?: TimeZoneOptions): AdDate {
  let ad: AdDate;
  if (input instanceof Date) ad = calendarDayOf(input, options);
  else if (typeof input === 'string') ad = parseYmd(input, 'AD');
  else if (isPlainDate(input)) ad = { year: Number(input.year), month: Number(input.month), day: Number(input.day) };
  else throw new TypeError('Expected a Date, an { year, month, day } object or a "YYYY-MM-DD" string');
  if (!isValidAd(ad.year, ad.month, ad.day)) {
    throw new RangeError(`Invalid AD date: ${ad.year}-${ad.month}-${ad.day}`);
  }
  return ad;
}

/** Normalize any BS input to a validated BS date. @internal */
export function normalizeBs(input: BsInput): BsDate {
  let bs: BsDate;
  if (typeof input === 'string') bs = parseYmd(input, 'BS');
  else if (isPlainDate(input)) bs = { year: Number(input.year), month: Number(input.month), day: Number(input.day) };
  else throw new TypeError('Expected an { year, month, day } object or a "YYYY-MM-DD" string');
  assertValidBs(bs);
  return bs;
}

function assertValidBs(bs: BsDate): void {
  const entry = getYearEntry(bs.year);
  if (!entry) {
    const { min, max } = getSupportedRange();
    throw new RangeError(`BS year ${bs.year} is outside the supported range ${min.year}–${max.year}`);
  }
  const length = Number.isInteger(bs.month) ? entry.months[bs.month - 1] : undefined;
  if (length === undefined || !Number.isInteger(bs.day) || bs.day < 1 || bs.day > length) {
    throw new RangeError(`Invalid BS date: ${formatBs(bs)}`);
  }
}

/** Day number (days since 1970-01-01) for a validated BS date. @internal */
export function bsToDayNumber(bs: BsDate): number {
  const entry = getYearEntry(bs.year)!;
  let n = entry.start;
  for (let m = 0; m < bs.month - 1; m++) n += entry.months[m]!;
  return n + bs.day - 1;
}

/** BS date for a day number. Throws if outside the supported range. @internal */
export function dayNumberToBs(dayNumber: number): BsDate {
  if (dayNumber < firstDayNumber() || dayNumber > lastDayNumber()) {
    const ad = dayNumberToAd(dayNumber);
    const { min, max } = getSupportedRange();
    throw new RangeError(
      `Date ${ad.year}-${ad.month}-${ad.day} AD is outside the supported range (${formatBs(min)} to ${formatBs(max)} BS)`,
    );
  }
  const index = yearIndexForDayNumber(dayNumber);
  const entry = yearAt(index);
  let remaining = dayNumber - entry.start;
  let month = 0;
  while (remaining >= entry.months[month]!) {
    remaining -= entry.months[month]!;
    month++;
  }
  return { year: FIRST_YEAR + index, month: month + 1, day: remaining + 1 };
}

/**
 * Convert a Gregorian (AD) date to Bikram Sambat (BS).
 *
 * @example
 * toBs('2026-10-01') // { year: 2083, month: 6, day: 15 }
 * toBs(new Date(), { timeZone: 'nepal' })
 */
export function toBs(input: AdInput, options?: TimeZoneOptions): BsDate {
  const ad = normalizeAd(input, options);
  return dayNumberToBs(adToDayNumber(ad.year, ad.month, ad.day));
}

/**
 * Convert a Bikram Sambat (BS) date to a Gregorian (AD) calendar date.
 * Returns a plain object, so the result never depends on a timezone.
 *
 * @example
 * toAd({ year: 2083, month: 7, day: 1 }) // { year: 2026, month: 10, day: 18 }
 */
export function toAd(input: BsInput): AdDate {
  return dayNumberToAd(bsToDayNumber(normalizeBs(input)));
}

/**
 * Convert a BS date to a JavaScript `Date` at midnight of that day.
 *
 * With `timeZone: "local"` (default) the result is local midnight, like `new Date(y, m - 1, d)`.
 * With `"utc"` it is UTC midnight; with `"nepal"` it is midnight Nepal time.
 */
export function toDate(input: BsInput, options: TimeZoneOptions = {}): Date {
  const ad = toAd(input);
  const mode = options.timeZone ?? 'local';
  if (mode === 'local') return new Date(ad.year, ad.month - 1, ad.day);
  const utcMidnight = Date.UTC(ad.year, ad.month - 1, ad.day);
  if (mode === 'utc') return new Date(utcMidnight);
  if (mode === 'nepal') {
    const offsetMinutes = ad.year >= 1986 ? 345 : 330;
    return new Date(utcMidnight - offsetMinutes * MS_PER_MINUTE);
  }
  throw new TypeError(`Unknown timeZone option: ${String(mode)}`);
}

/**
 * Today's BS date.
 *
 * Defaults to the runtime's local timezone. Pass `{ timeZone: "nepal" }` for "today in Nepal"
 * regardless of where the code runs (useful on servers).
 */
export function today(options?: TimeZoneOptions): BsDate {
  return toBs(new Date(), options);
}

/** `true` if `year`/`month`/`day` is a real BS date inside the supported range. Never throws. */
export function isValidBs(year: number, month: number, day: number): boolean {
  try {
    assertValidBs({ year, month, day });
    return true;
  } catch {
    return false;
  }
}

/** Number of days in a BS month. `month` is 1-based. */
export function daysInBsMonth(year: number, month: number): number {
  const entry = getYearEntry(year);
  const length = entry && Number.isInteger(month) ? entry.months[month - 1] : undefined;
  if (length === undefined) throw new RangeError(`No data for BS ${year}-${month}`);
  return length;
}

/** Number of days in a BS year (365 or 366). */
export function daysInBsYear(year: number): number {
  const entry = getYearEntry(year);
  if (!entry) throw new RangeError(`No data for BS year ${year}`);
  return entry.months.reduce((a, b) => a + b, 0);
}
