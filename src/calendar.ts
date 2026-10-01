import { EPOCH_AD, FIRST_YEAR, LAST_VERIFIED_YEAR, MONTH_LENGTHS } from './data';
import { adToDayNumber } from './gregorian';
import type { BsDate, YearStatus } from './types';

interface YearEntry {
  months: number[];
  status: YearStatus;
  /** Day number (days since 1970-01-01) of 1 Baisakh of this year. */
  start: number;
}

const EPOCH_DAY = adToDayNumber(EPOCH_AD.year, EPOCH_AD.month, EPOCH_AD.day);

let years: YearEntry[] = [];

function decode(encoded: string): number[] {
  return Array.from(encoded, (c) => 29 + Number(c));
}

function rebuildStarts(from: number): void {
  for (let i = from; i < years.length; i++) {
    const prev = years[i - 1];
    years[i]!.start = prev ? prev.start + sum(prev.months) : EPOCH_DAY;
  }
}

function sum(values: readonly number[]): number {
  let total = 0;
  for (const v of values) total += v;
  return total;
}

function load(): void {
  years = MONTH_LENGTHS.map((encoded, i) => ({
    months: decode(encoded),
    status: FIRST_YEAR + i <= LAST_VERIFIED_YEAR ? 'verified' : 'provisional',
    start: 0,
  }));
  rebuildStarts(0);
}

load();

/** @internal */
export function getYearEntry(year: number): YearEntry | undefined {
  return Number.isInteger(year) ? years[year - FIRST_YEAR] : undefined;
}

/** @internal */
export function firstDayNumber(): number {
  return years[0]!.start;
}

/** @internal */
export function lastDayNumber(): number {
  const last = years[years.length - 1]!;
  return last.start + sum(last.months) - 1;
}

/** @internal */
export function yearIndexForDayNumber(dayNumber: number): number {
  // Binary search over year starts.
  let lo = 0;
  let hi = years.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (years[mid]!.start <= dayNumber) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** @internal */
export function yearAt(index: number): YearEntry {
  return years[index]!;
}

/** The first and last BS dates this library can convert. */
export function getSupportedRange(): { min: BsDate; max: BsDate } {
  const lastYear = FIRST_YEAR + years.length - 1;
  const lastMonths = years[years.length - 1]!.months;
  return {
    min: { year: FIRST_YEAR, month: 1, day: 1 },
    max: { year: lastYear, month: 12, day: lastMonths[11]! },
  };
}

/**
 * How trustworthy the data for a BS year is.
 *
 * - `"verified"`: matches the published official calendar.
 * - `"provisional"`: the official calendar is not published yet (or sources disagree);
 *   conversions may shift by a day when it is.
 *
 * Returns `undefined` for years outside the supported range.
 */
export function getYearStatus(year: number): YearStatus | undefined {
  return getYearEntry(year)?.status;
}

export interface RegisterYearOptions {
  /** Defaults to `"provisional"`. */
  status?: YearStatus;
}

/**
 * Add or replace the month lengths for a BS year, e.g. when the Nepal Panchanga Nirnayak
 * Samiti publishes a new calendar before this package is updated.
 *
 * `year` must be an existing supported year or the year right after the last one.
 * `monthLengths` must hold 12 integers between 29 and 32 that add up to 365 or 366.
 *
 * Changing a year shifts every later year's mapping, exactly as a real calendar correction would.
 * The change is global for the current JavaScript realm.
 */
export function registerYear(year: number, monthLengths: readonly number[], options: RegisterYearOptions = {}): void {
  const lastYear = FIRST_YEAR + years.length - 1;
  if (!Number.isInteger(year) || year < FIRST_YEAR || year > lastYear + 1) {
    throw new RangeError(`registerYear: year must be an integer from ${FIRST_YEAR} to ${lastYear + 1}, got ${year}`);
  }
  if (
    !Array.isArray(monthLengths) ||
    monthLengths.length !== 12 ||
    !monthLengths.every((d) => Number.isInteger(d) && d >= 29 && d <= 32)
  ) {
    throw new TypeError('registerYear: monthLengths must be 12 integers between 29 and 32');
  }
  const total = sum(monthLengths);
  if (total !== 365 && total !== 366) {
    throw new RangeError(`registerYear: a BS year has 365 or 366 days, got ${total}`);
  }
  const index = year - FIRST_YEAR;
  const entry: YearEntry = { months: [...monthLengths], status: options.status ?? 'provisional', start: 0 };
  if (index === years.length) years.push(entry);
  else years[index] = entry;
  rebuildStarts(index);
}

/** Restore the calendar data that ships with the package (undoes {@link registerYear}). */
export function resetCalendarData(): void {
  load();
}
