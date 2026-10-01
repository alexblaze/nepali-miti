# nepali-miti

[![npm version](https://img.shields.io/npm/v/nepali-miti.svg)](https://www.npmjs.com/package/nepali-miti)
[![CI](https://github.com/alexblaze/nepali-miti/actions/workflows/ci.yml/badge.svg)](https://github.com/alexblaze/nepali-miti/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/nepali-miti.svg)](./LICENSE)

Accurate, timezone-safe **Bikram Sambat (BS) ⇄ Gregorian (AD)** date conversion for JavaScript and TypeScript —
plus formatting in English and Nepali, parsing, date math, and month grids for building calendars and date pickers.

- **Checked against published calendars.** BS 2083 matches the government's own Nepal Gazette holiday notice:
  every Saturday, 36 holiday weekdays, and Christmas falling on 25 December. Every month start from BS 2075–2086
  matches Hamro Patro, and BS 2000–2082 matches the agreed result of five other libraries.
  ([How the data was checked](./docs/DATA.md))
- **Honest about future years.** The official calendar is published about one year ahead. Each year is marked
  `verified` or `provisional`, and you can add a corrected year at runtime with no package upgrade.
- **The same result in every timezone.** Conversion uses whole-day arithmetic, never `Date` parsing. The test suite
  runs in UTC−11, UTC−8, UTC+05:45 and UTC+14.
- **Zero dependencies, about 4 KB gzipped** (about 1.8 KB if you import only `toBs`/`toAd`). ESM and CommonJS, with
  TypeScript types and tree-shaking support.
- Works in Node.js 18+, all modern browsers, Deno, Bun, edge runtimes and React Server Components.

> मिति (_miti_) means "date" in Nepali.

## Why another Nepali date library?

When this package was written (October 2026), the popular converters disagreed with each other from **Kartik 2083**
onward:

| Problem found                                                                             | Affected                                                                                           |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Asoj 2083 treated as 30 days, so every date from 1 Kartik 2083 (18 Oct 2026) is a day off | `bikram-sambat-js` 1.0.3 (also used by `nepali-datepicker-reactjs`)                                |
| 15 of 36 month starts in BS 2084–2086 differ from Hamro Patro                             | `nepali-date-converter` 3.4.0, `nepali-datetime` 2.0.0, `@remotemerge/nepali-date-converter` 1.2.1 |
| BS → AD returns the previous day when run in the Americas                                 | `@remotemerge/nepali-date-converter` 1.2.1                                                         |

These are differences in data and timezone handling, not criticism of those projects. Each library had to guess
future years, because the official calendar is published only about a year ahead. `nepali-miti` makes that
uncertainty visible (`getYearStatus`) and fixable (`registerYear`).

## Installation

```sh
npm install nepali-miti
# or: pnpm add nepali-miti / yarn add nepali-miti / bun add nepali-miti
```

## Usage

```ts
import { toBs, toAd, format, today } from 'nepali-miti';

toBs('2026-10-01'); // { year: 2083, month: 6, day: 15 }
toAd({ year: 2083, month: 7, day: 1 }); // { year: 2026, month: 10, day: 18 }

format(toBs('2026-10-18'), 'dddd, D MMMM YYYY'); // "Sunday, 1 Kartik 2083"
format(toBs('2026-10-18'), 'dddd, D MMMM YYYY', { locale: 'ne' }); // "आइतबार, १ कार्तिक २०८३"

today({ timeZone: 'nepal' }); // today's date in Nepal, wherever the code runs
```

Months are **1-based** everywhere (1 = Baisakh, 12 = Chaitra; 1 = January), unlike JavaScript's `Date`.

## API

All functions are named exports. A BS date is a plain `{ year, month, day }` object. Wherever a date is accepted, you
can also pass a `"YYYY-MM-DD"` string (`/` and `.` separators and Devanagari digits also work). Invalid input throws
`TypeError`, and a non-existent or out-of-range date throws `RangeError`.

### Conversion

| Function                      | Description                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| `toBs(ad, options?) → BsDate` | AD → BS. `ad` is a `Date`, an `{ year, month, day }` object or a `"YYYY-MM-DD"` string. |
| `toAd(bs) → AdDate`           | BS → AD as a plain `{ year, month, day }` object (no timezone involved).                |
| `toDate(bs, options?) → Date` | BS → a JavaScript `Date` at midnight in the chosen timezone.                            |
| `today(options?) → BsDate`    | The current BS date.                                                                    |

`options.timeZone` decides which calendar day a `Date` instant belongs to:

| Value               | Meaning                                                                      |
| ------------------- | ---------------------------------------------------------------------------- |
| `"local"` (default) | The runtime's timezone, the same as `date.getDate()`.                        |
| `"utc"`             | UTC, the same as `date.getUTCDate()`.                                        |
| `"nepal"`           | Nepal Standard Time (UTC+05:45; UTC+05:30 before 1986). Use this on servers. |

```ts
const instant = new Date('2026-10-01T20:00:00Z');
toBs(instant, { timeZone: 'utc' }); // { year: 2083, month: 6, day: 15 }
toBs(instant, { timeZone: 'nepal' }); // { year: 2083, month: 6, day: 16 } (already 01:45 on the 16th in Kathmandu)

toDate('2083-06-15', { timeZone: 'nepal' }).toISOString(); // "2026-09-30T18:15:00.000Z"
```

### Validation and calendar info

| Function                                | Description                                                          |
| --------------------------------------- | -------------------------------------------------------------------- |
| `isValidBs(year, month, day) → boolean` | Whether the date exists and is in the supported range. Never throws. |
| `daysInBsMonth(year, month) → number`   | 29–32.                                                               |
| `daysInBsYear(year) → number`           | 365 or 366.                                                          |
| `getWeekday(bs) → number`               | 0 = Sunday … 6 = Saturday.                                           |
| `getSupportedRange() → { min, max }`    | First and last convertible BS dates.                                 |
| `getYearStatus(year)`                   | `"verified"`, `"provisional"` or `undefined` (out of range).         |

### Date arithmetic

| Function                          | Description                                                                            |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| `addDays(bs, n) → BsDate`         | Adds whole days. Use a negative `n` to subtract.                                       |
| `addMonths(bs, n) → BsDate`       | Adds months, clamping the day to the target month's length (32 Asar + 1 → 31 Shrawan). |
| `addYears(bs, n) → BsDate`        | Adds years, clamping the day the same way.                                             |
| `differenceInDays(a, b) → number` | `b − a` in days.                                                                       |
| `compareBs(a, b) → -1 \| 0 \| 1`  | A sort comparator: `dates.sort(compareBs)`.                                            |
| `isSameBsDay(a, b) → boolean`     | Whether both dates are the same day.                                                   |

### Formatting and parsing

```ts
format(bs, pattern = 'YYYY-MM-DD', { locale: 'en' | 'ne' } = {}) → string
parse(text, pattern = 'YYYY-MM-DD') → BsDate
```

| Token  | English  | Nepali (`locale: 'ne'`) |
| ------ | -------- | ----------------------- |
| `YYYY` | 2083     | २०८३                    |
| `YY`   | 83       | ८३                      |
| `MMMM` | Asoj     | असोज                    |
| `MMM`  | Aso      | असोज                    |
| `MM`   | 06       | ०६                      |
| `M`    | 6        | ६                       |
| `DD`   | 05       | ०५                      |
| `D`    | 5        | ५                       |
| `dddd` | Thursday | बिहीबार                 |
| `ddd`  | Thu      | बिही                    |
| `d`    | 4        | ४                       |

Text inside `[brackets]` is copied as is. `parse` understands `YYYY`, `MMMM` (English, case-insensitive, or Nepali),
`MM`, `M`, `DD` and `D`, with English or Devanagari digits:

```ts
parse('15/06/2083', 'DD/MM/YYYY'); // { year: 2083, month: 6, day: 15 }
parse('१ कार्तिक २०८३', 'D MMMM YYYY'); // { year: 2083, month: 7, day: 1 }
```

### Calendar grids (for date pickers)

```ts
getMonthGrid(year, month, { weekStartsOn = 0, fillWeeks = true } = {}) → (MonthGridDay | null)[][]
```

This returns the weeks of a month. Each cell is
`{ bs, ad, weekday, inMonth }`. With `fillWeeks` (the default), the first and last weeks are padded with days from the
neighbouring months, marked `inMonth: false`. Cells outside the supported range are `null`.

```tsx
const weeks = getMonthGrid(2083, 6);

<table>
  <tbody>
    {weeks.map((week, i) => (
      <tr key={i}>
        {week.map((cell, j) => (
          <td key={j} className={cell?.inMonth ? '' : 'muted'}>
            {cell && format(cell.bs, 'D', { locale: 'ne' })}
          </td>
        ))}
      </tr>
    ))}
  </tbody>
</table>;
```

### Names and digits

```ts
BS_MONTHS.en / BS_MONTHS.ne;
BS_MONTHS_SHORT;
WEEKDAYS;
WEEKDAYS_SHORT; // index 0 = Baisakh / Sunday
getMonthName(7, { locale: 'ne' }); // "कार्तिक"
getWeekdayName(0, { short: true }); // "Sun"
toNepaliDigits(2083); // "२०८३"
toEnglishDigits('२०८३'); // "2083"
```

### Updating calendar data at runtime

The Nepal Panchanga Nirnayak Samiti publishes each year's calendar ahead of time. If a published year differs from the
provisional data, or you need a year after BS 2090, you can register it yourself:

```ts
import { registerYear, getYearStatus } from 'nepali-miti';

// 12 month lengths, Baisakh → Chaitra. They must add up to 365 or 366.
registerYear(2084, [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30], { status: 'verified' });
getYearStatus(2084); // "verified"
```

Changing a year moves every later date, just as a real calendar correction would. The change applies to the whole
JavaScript realm, so run it once at startup. `resetCalendarData()` undoes it. Please also
[open an issue](https://github.com/alexblaze/nepali-miti/issues) so everyone gets the fix.

## Supported range and accuracy

| BS years  | AD (approx.)      | Status        | Source                                                                         |
| --------- | ----------------- | ------------- | ------------------------------------------------------------------------------ |
| 2000–2074 | Apr 1943–Apr 2018 | `verified`    | Five independent libraries agree on every month.                               |
| 2075–2083 | Apr 2018–Apr 2027 | `verified`    | The libraries agree (except one, from Kartik 2083), and so does Hamro Patro.   |
| 2084–2086 | Apr 2027–Apr 2030 | `provisional` | Matches Hamro Patro and `bikram-sambat` (medic); not yet officially published. |
| 2087–2090 | Apr 2030–Apr 2034 | `provisional` | `bikram-sambat` (medic) data; sources disagree. Expect corrections.            |

Details, methodology and how to report a discrepancy: [docs/DATA.md](./docs/DATA.md).
Nothing here is guaranteed to be 100% correct. Provisional years may shift by a day when the official calendar is
published.

## TypeScript

Types are included. Every exported type (`BsDate`, `AdDate`, `BsInput`, `AdInput`, `Locale`, `TimeZoneMode`,
`YearStatus`, `MonthGridDay`, …) is a named export. The package is checked with `@arethetypeswrong/cli` for the
`node16` (ESM and CJS) and `bundler` resolution modes.

## Next.js and React Server Components

The package has no side effects, uses no browser APIs and needs no `"use client"` directive. One thing to watch for:
"today" depends on the timezone. A server rendering in UTC and a browser in Nepal can disagree for 5 h 45 m each day.
Pass `{ timeZone: 'nepal' }` when you mean Nepal's date:

```tsx
// app/page.tsx (Server Component)
import { format, today } from 'nepali-miti';

export default function Page() {
  return <p>आज: {format(today({ timeZone: 'nepal' }), 'YYYY MMMM D, dddd', { locale: 'ne' })}</p>;
}
```

## Browser and runtime support

The output targets ES2020 with no polyfills needed. CI runs the full test suite on Node.js 20, 22 and 24, and a smoke
test of the built package on Node.js 18. The package uses only standard `Date` and string APIs, so any runtime that
supports ES2020 works.

## Performance

- Conversion uses a small binary search over 91 years, then a walk of at most 12 months. There is no per-day loop and
  no lazy table building.
- The whole package is about 4 KB minified and gzipped. Calendar data is stored as 91 strings of 12 characters each.

## Contributing

Bug reports with a reference calendar link are especially welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Development

```sh
npm install
npm run dev        # rebuild on change
npm test           # vitest
npm run coverage   # coverage report (thresholds enforced)
npm run lint       # eslint + prettier + tsc
npm run build      # ESM + CJS + .d.ts via tsup
npm run check:package  # publint + are-the-types-wrong
```

## License

[MIT](./LICENSE) © alexblaze. Calendar month-length data for BS 2087–2090 comes from
[bikram-sambat](https://github.com/medic/bikram-sambat) (Apache-2.0); see [docs/DATA.md](./docs/DATA.md).
