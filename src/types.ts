/** A Bikram Sambat (BS) calendar date. `month` is 1-based (1 = Baisakh, 12 = Chaitra). */
export interface BsDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

/** A Gregorian (AD) calendar date with no time or timezone. `month` is 1-based (1 = January). */
export interface AdDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

/**
 * Which timezone to use when reading the calendar day out of a JavaScript `Date` instant
 * (or when building a `Date` from a calendar day).
 *
 * - `"local"` (default): the runtime's local timezone, same as `date.getFullYear()` etc.
 * - `"utc"`: UTC, same as `date.getUTCFullYear()` etc.
 * - `"nepal"`: Nepal Standard Time (UTC+05:45; UTC+05:30 before 1986).
 */
export type TimeZoneMode = 'local' | 'utc' | 'nepal';

export interface TimeZoneOptions {
  timeZone?: TimeZoneMode;
}

/** Output language for names and digits. */
export type Locale = 'en' | 'ne';

/** Data confidence for a BS year. */
export type YearStatus = 'verified' | 'provisional';

/** Anything accepted where an AD date is expected. Strings must be `YYYY-MM-DD`. */
export type AdInput = Date | AdDate | string;

/** Anything accepted where a BS date is expected. Strings must be `YYYY-MM-DD` (English or Devanagari digits). */
export type BsInput = BsDate | string;
