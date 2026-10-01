# Calendar data: sources, method and limits

The Bikram Sambat (BS) calendar used in Nepal is solar, but month lengths (29–32 days) come from astronomical
calculations published each year by the **Nepal Panchanga Nirnayak Samiti**. There is no simple formula, so every
converter depends on a table of month lengths. This document explains where `nepali-miti`'s table came from and how
far you can trust it.

## Supported range

BS 2000-01-01 (1943-04-14 AD) to BS 2090-12-30 (2034-04-13 AD). 1 Baisakh 2000 BS is fixed at 14 April 1943 AD,
and every other date is counted in whole days from there.

## How the table was built (October 2026)

1. **Cross-library comparison.** The AD date of day 1 of every BS month was computed with five libraries:
   `nepali-date-converter@3.4.0`, `nepali-datetime@2.0.0`, `bikram-sambat@1.8.1`, `bikram-sambat-js@1.0.3` and
   `@remotemerge/nepali-date-converter@1.2.1` (the last run with `TZ=Asia/Kathmandu` because of a timezone bug).
   For **BS 2000–2082 all five agree on every month**. That consensus is stored in
   [`tests/fixtures/consensus-month-starts.json`](../tests/fixtures/consensus-month-starts.json) and checked by the
   test suite.
2. **Published calendar check.** Month starts for BS 2075–2086 were collected from
   [Hamro Patro](https://www.hamropatro.com/en/calendar/2083/7) and stored in
   [`tests/fixtures/hamropatro-month-starts.json`](../tests/fixtures/hamropatro-month-starts.json). All 143 collected
   months match this package. Asoj 2083 = 31 days was also confirmed on
   [nepalicalendar.rat32.com](https://nepalicalendar.rat32.com/2083/ashwin).
3. **Government source for BS 2083.** The Ministry of Home Affairs holiday notice in the Nepal Gazette
   (Nepal Rajpatra, Vol. 75, No. 67, Part 5, 2082-11-18) lists every Saturday of 2083 and the weekday of each
   holiday. Because Saturdays run continuously across month boundaries, they pin down every month length of 2083.
   All of them, plus four holidays fixed to Gregorian dates (1 May, 3 December, 25 December, 8 March), match this
   package. They are stored in
   [`tests/fixtures/gazette-2083-weekdays.json`](../tests/fixtures/gazette-2083-weekdays.json).
4. **Where sources disagreed:**
   - **2083 (Kartik onward):** `bikram-sambat-js` gives Asoj 30 days. Hamro Patro, rat32 and the other four libraries
     give 31. This package uses 31.
   - **2084–2086:** `nepali-date-converter`, `nepali-datetime` and `@remotemerge/nepali-date-converter` differ from
     Hamro Patro in 15 of 36 months. `bikram-sambat` (medic) matches Hamro Patro exactly. This package uses that data
     and marks these years `provisional`.
   - **2087–2090:** every source disagrees with every other, and Hamro Patro's far-future pages look extrapolated
     (for example, 1 Baisakh 2088 on 16 April 2031, two days later than usual). This package uses `bikram-sambat`
     (medic, Apache-2.0) data and marks these years `provisional`.

## Status per year

| Years     | `getYearStatus()` | Confidence                                                                                                           |
| --------- | ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| 2000–2083 | `verified`        | High: the published calendar is out and all independent sources agree.                                               |
| 2084–2090 | `provisional`     | Will change if the official calendar differs. Check `getYearStatus()` for anything legally or financially important. |

## Updating the data

- **In your app, right away:** `registerYear(year, monthLengths, { status: 'verified' })`.
- **In the package:** edit `src/data.ts` (one 12-digit string per year; each digit is the month length minus 29),
  add the published month starts to a fixture, move `LAST_VERIFIED_YEAR` forward and open a pull request with a link
  to the source. Releases that change data are **minor** versions and are listed under "Calendar data" in the
  changelog.

## Things this package does not do

- **Tithi, festivals and holidays.** These are not part of date conversion. They may come later as a separate
  package, so holiday updates never touch the conversion engine.
- **Dates before BS 2000.** Older tables in existing libraries disagree with each other, and no reliable reference
  was available to settle them.
- **Time of day.** Values are calendar days. Use `toDate`/`toBs` with a `timeZone` option to move to and from
  `Date` instants.

## Attribution

Month lengths for BS 2084–2090 match, and for 2087–2090 are taken from,
[medic/bikram-sambat](https://github.com/medic/bikram-sambat), © Medic, licensed under Apache-2.0.
