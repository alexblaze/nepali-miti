# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Changes to calendar data are listed under **Calendar data** and released as minor versions.

## [1.0.0] - 2026-10-01

### Added

- `toBs`, `toAd`, `toDate`, `today`: BS ⇄ AD conversion with explicit `local` / `utc` / `nepal` timezone handling.
- `isValidBs`, `daysInBsMonth`, `daysInBsYear`, `getWeekday`.
- `addDays`, `addMonths`, `addYears`, `differenceInDays`, `compareBs`, `isSameBsDay`.
- `format` and `parse` with English and Nepali (Devanagari) month names, weekdays and digits.
- `getMonthGrid` for building calendar and date-picker month views.
- `getSupportedRange`, `getYearStatus`, `registerYear` and `resetCalendarData` for checking and updating calendar
  data at runtime.
- ESM and CommonJS builds, TypeScript declarations, zero runtime dependencies.

### Calendar data

- BS 2000–2083 `verified`; BS 2084–2090 `provisional`. See [docs/DATA.md](./docs/DATA.md).

[1.0.0]: https://github.com/alexblaze/nepali-miti/releases/tag/v1.0.0
