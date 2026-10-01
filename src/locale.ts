import type { Locale } from './types';

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'] as const;

/** BS month names, index 0 = Baisakh. */
export const BS_MONTHS: Readonly<Record<Locale, readonly string[]>> = {
  en: [
    'Baisakh',
    'Jestha',
    'Asar',
    'Shrawan',
    'Bhadra',
    'Asoj',
    'Kartik',
    'Mangsir',
    'Poush',
    'Magh',
    'Falgun',
    'Chaitra',
  ],
  ne: ['बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कार्तिक', 'मंसिर', 'पुस', 'माघ', 'फागुन', 'चैत'],
};

/** Short BS month names, index 0 = Baisakh. */
export const BS_MONTHS_SHORT: Readonly<Record<Locale, readonly string[]>> = {
  en: ['Bai', 'Jes', 'Asa', 'Shr', 'Bha', 'Aso', 'Kar', 'Man', 'Pou', 'Mag', 'Fal', 'Cha'],
  // Nepali month names are already short; abbreviating them (e.g. Asar/Asoj → "अ") would be ambiguous.
  ne: ['बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कार्तिक', 'मंसिर', 'पुस', 'माघ', 'फागुन', 'चैत'],
};

/** Weekday names, index 0 = Sunday. */
export const WEEKDAYS: Readonly<Record<Locale, readonly string[]>> = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  ne: ['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'],
};

/** Short weekday names, index 0 = Sunday. */
export const WEEKDAYS_SHORT: Readonly<Record<Locale, readonly string[]>> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ne: ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'],
};

/** Convert ASCII digits in a string or number to Devanagari digits. Other characters are kept. */
export function toNepaliDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => DEVANAGARI_DIGITS[Number(d)]!);
}

/** Convert Devanagari digits in a string to ASCII digits. Other characters are kept. */
export function toEnglishDigits(value: string): string {
  return value.replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 0x0966));
}

/** Get a BS month name. `month` is 1-based. */
export function getMonthName(month: number, options: { locale?: Locale; short?: boolean } = {}): string {
  const table = options.short ? BS_MONTHS_SHORT : BS_MONTHS;
  const name = table[options.locale ?? 'en'][month - 1];
  if (name === undefined || !Number.isInteger(month)) {
    throw new RangeError(`getMonthName: month must be an integer from 1 to 12, got ${month}`);
  }
  return name;
}

/** Get a weekday name. `weekday` is 0 (Sunday) to 6 (Saturday). */
export function getWeekdayName(weekday: number, options: { locale?: Locale; short?: boolean } = {}): string {
  const table = options.short ? WEEKDAYS_SHORT : WEEKDAYS;
  const name = table[options.locale ?? 'en'][weekday];
  if (name === undefined || !Number.isInteger(weekday)) {
    throw new RangeError(`getWeekdayName: weekday must be an integer from 0 to 6, got ${weekday}`);
  }
  return name;
}
