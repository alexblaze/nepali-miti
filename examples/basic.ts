import { addDays, format, getYearStatus, parse, toAd, toBs, today } from 'nepali-miti';

// Today's date in Nepal, whatever timezone the server runs in.
const now = today({ timeZone: 'nepal' });
console.log(format(now, 'dddd, D MMMM YYYY', { locale: 'ne' }));

// Convert a birthday entered in BS.
const birthday = parse('2055-02-10');
console.log('Born on', toAd(birthday)); // { year: 1998, month: 5, day: 24 }

// Due date 45 days after an AD invoice date, shown in BS.
const due = addDays(toBs('2026-10-01'), 45);
console.log('Due:', format(due, 'D MMMM YYYY'));

// Warn if a far-future date relies on provisional calendar data.
if (getYearStatus(due.year) === 'provisional') {
  console.warn(`BS ${due.year} is not officially published yet; the date may shift by a day.`);
}
