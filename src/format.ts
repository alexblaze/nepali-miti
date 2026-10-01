import { getWeekday } from './arithmetic';
import { normalizeBs } from './convert';
import { BS_MONTHS, BS_MONTHS_SHORT, toEnglishDigits, toNepaliDigits, WEEKDAYS, WEEKDAYS_SHORT } from './locale';
import type { BsDate, BsInput, Locale } from './types';

export interface FormatOptions {
  /** `"en"` (default) for English names and digits, `"ne"` for Nepali names and Devanagari digits. */
  locale?: Locale;
}

const TOKEN = /\[([^\]]*)]|YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|d/g;

const pad = (n: number, width: number): string => String(n).padStart(width, '0');

/**
 * Format a BS date.
 *
 * | Token  | Output (en)      | Output (ne)  |
 * | ------ | ---------------- | ------------ |
 * | `YYYY` | 2083             | २०८३         |
 * | `YY`   | 83               | ८३           |
 * | `MMMM` | Asoj             | असोज         |
 * | `MMM`  | Aso              | असोज         |
 * | `MM`   | 06               | ०६           |
 * | `M`    | 6                | ६            |
 * | `DD`   | 05               | ०५           |
 * | `D`    | 5                | ५            |
 * | `dddd` | Thursday         | बिहीबार      |
 * | `ddd`  | Thu              | बिही         |
 * | `d`    | 4 (0 = Sunday)   | ४            |
 *
 * Wrap literal text in square brackets: `format(d, "[Miti:] YYYY")`.
 *
 * @example
 * format('2083-06-15', 'D MMMM YYYY, dddd')               // "15 Asoj 2083, Thursday"
 * format('2083-06-15', 'YYYY MMMM D, dddd', { locale: 'ne' }) // "२०८३ असोज १५, बिहीबार"
 */
export function format(input: BsInput, pattern = 'YYYY-MM-DD', options: FormatOptions = {}): string {
  const bs = normalizeBs(input);
  const locale = options.locale ?? 'en';
  if (locale !== 'en' && locale !== 'ne') throw new TypeError(`Unknown locale: ${String(locale)}`);
  const digits = locale === 'ne' ? toNepaliDigits : (s: string): string => s;
  let weekday: number | undefined;
  const wd = (): number => (weekday ??= getWeekday(bs));

  return pattern.replace(TOKEN, (token: string, literal: string | undefined) => {
    if (literal !== undefined) return literal;
    switch (token) {
      case 'YYYY':
        return digits(String(bs.year));
      case 'YY':
        return digits(pad(bs.year % 100, 2));
      case 'MMMM':
        return BS_MONTHS[locale][bs.month - 1]!;
      case 'MMM':
        return BS_MONTHS_SHORT[locale][bs.month - 1]!;
      case 'MM':
        return digits(pad(bs.month, 2));
      case 'M':
        return digits(String(bs.month));
      case 'DD':
        return digits(pad(bs.day, 2));
      case 'D':
        return digits(String(bs.day));
      case 'dddd':
        return WEEKDAYS[locale][wd()]!;
      case 'ddd':
        return WEEKDAYS_SHORT[locale][wd()]!;
      default: // 'd'
        return digits(String(wd()));
    }
  });
}

const PARSE_TOKEN = /\[([^\]]*)]|YYYY|MMMM|MM|M|DD|D/g;

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Parse a BS date string with a pattern. Accepts English or Devanagari digits and English or
 * Nepali month names (for `MMMM`). Supported tokens: `YYYY`, `MMMM`, `MM`, `M`, `DD`, `D`,
 * and `[literal]` text. Matching is case-insensitive for English month names.
 *
 * Throws `TypeError` if the text does not match, or `RangeError` if it is not a real BS date.
 *
 * @example
 * parse('2083/06/15', 'YYYY/MM/DD') // { year: 2083, month: 6, day: 15 }
 * parse('१५ असोज २०८३', 'D MMMM YYYY') // { year: 2083, month: 6, day: 15 }
 */
export function parse(text: string, pattern = 'YYYY-MM-DD'): BsDate {
  if (typeof text !== 'string') throw new TypeError('parse: text must be a string');
  const order: string[] = [];
  let source = '';
  let last = 0;
  for (const match of pattern.matchAll(PARSE_TOKEN)) {
    source += escapeRegExp(pattern.slice(last, match.index));
    last = match.index + match[0].length;
    if (match[1] !== undefined) {
      source += escapeRegExp(match[1]);
      continue;
    }
    const token = match[0];
    order.push(token);
    if (token === 'YYYY') source += '(\\d{4})';
    else if (token === 'MMMM') source += `(${[...BS_MONTHS.en, ...BS_MONTHS.ne].map(escapeRegExp).join('|')})`;
    else if (token === 'MM' || token === 'DD') source += '(\\d{2})';
    else source += '(\\d{1,2})';
  }
  source += escapeRegExp(pattern.slice(last));

  const match = new RegExp(`^\\s*${source}\\s*$`, 'i').exec(toEnglishDigits(text));
  if (!match) throw new TypeError(`parse: "${text}" does not match pattern "${pattern}"`);

  const parts: Record<string, number> = {};
  order.forEach((token, i) => {
    const raw = match[i + 1]!;
    if (token === 'MMMM') {
      const lower = raw.toLowerCase();
      const index = BS_MONTHS.en.findIndex((m) => m.toLowerCase() === lower);
      parts.month = index >= 0 ? index + 1 : BS_MONTHS.ne.indexOf(raw) + 1;
    } else {
      parts[token[0] === 'Y' ? 'year' : token[0] === 'M' ? 'month' : 'day'] = Number(raw);
    }
  });
  if (parts.year === undefined || parts.month === undefined || parts.day === undefined) {
    throw new TypeError(`parse: pattern "${pattern}" must contain a year, a month and a day token`);
  }
  return normalizeBs({ year: parts.year, month: parts.month, day: parts.day });
}
