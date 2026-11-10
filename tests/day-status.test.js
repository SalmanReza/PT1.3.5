import test from 'node:test';
import assert from 'node:assert/strict';
import { dayStatus } from '../src/day-status.js';
import { readText } from './helpers/read-text.js';

/* Fixed (faked) dates only. Umm al-Qura dates are resolved here once with
   Intl at local noon, the same way the app does, so the suite never depends
   on today's real date. */
const hijriFmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric' });
function hijriOf(y, m, d) {
  const parts = hijriFmt.formatToParts(new Date(y, m - 1, d, 12));
  const get = type => Number(parts.find(part => part.type === type).value);
  return { day: get('day'), month: get('month'), year: get('year') };
}
function statusOn(y, m, d, extra = {}) {
  const date = new Date(y, m - 1, d, 12);
  const hijri = hijriOf(y, m, d);
  return dayStatus({ weekday: date.getDay(), dayHijri: hijri, nightHijri: hijri, fardDone: 2, next: { name: 'Asr', time: '15:37' }, maghribTime: '17:13', ishaTime: '18:31', ...extra });
}

test('tier 1: date-specific days from the Hijri calendar (faked dates)', () => {
  assert.equal(statusOn(2027, 3, 9).key, 'eid-fitr');               // 1 Shawwal 1448
  assert.equal(statusOn(2027, 5, 16).key, 'eid-adha');              // 10 Dhul Hijjah
  assert.equal(statusOn(2027, 5, 15).key, 'arafah');                // 9 Dhul Hijjah (a Saturday)
  assert.equal(statusOn(2027, 5, 17).key, 'tashriq');
  assert.equal(statusOn(2027, 5, 7).key, 'dhul-hijjah');            // 1 Dhul Hijjah, a Friday: date beats weekday
  assert.match(statusOn(2027, 5, 7).title, /^Dhul Hijjah day 1 of 10$/);
  assert.equal(statusOn(2027, 6, 15).key, 'ashura');
  assert.equal(statusOn(2027, 6, 14).key, 'tasua');
  assert.equal(statusOn(2027, 6, 6).key, 'new-year');
  assert.match(statusOn(2027, 6, 6).title, /1449 AH/);
  assert.equal(statusOn(2026, 11, 23).key, 'white-days');           // 13 Jumada al-Akhirah, a Monday
  assert.equal(statusOn(2027, 1, 23).key, 'mid-shaban');            // 15 Sha'ban
  const ramadan = statusOn(2027, 2, 8);
  assert.equal(ramadan.key, 'ramadan-day');
  assert.equal(ramadan.title, 'Ramadan day 1');
  assert.equal(ramadan.detail, 'Ramadan Mubarak · Iftar at Maghrib, 17:13.');
  const night = statusOn(2027, 2, 9, { afterMaghrib: true, ishaTime: '6:31 PM' });
  assert.equal(night.key, 'ramadan-night');
  assert.equal(night.detail, 'Tarawih after Isha (6:31 PM).', 'the 12-hour toggle reaches the line');
  assert.equal(statusOn(2027, 2, 28).key, 'last-ten');
  assert.match(statusOn(2027, 2, 28).detail, /^An odd night/);
  assert.equal(statusOn(2027, 3, 6).key, 'qadr-27');
  assert.match(statusOn(2027, 3, 6).detail, /exact night is not fixed/);
});

test('night observances follow the sunset Hijri date, day observances the civil day', () => {
  const day = { month: 9, day: 20, year: 1448 }, night = { month: 9, day: 21, year: 1448 };
  assert.equal(dayStatus({ dayHijri: day, nightHijri: night, afterMaghrib: true }).key, 'last-ten');
  assert.equal(dayStatus({ dayHijri: { month: 8, day: 14 }, nightHijri: { month: 8, day: 15 } }).key, 'mid-shaban');
  assert.equal(dayStatus({ dayHijri: { month: 12, day: 8 }, nightHijri: { month: 12, day: 9 }, weekday: 2 }).key, 'dhul-hijjah', 'Arafah is a day-time observance');
});

test('only date-specific days produce a headline; ordinary days (any weekday, any progress) return null for the conversational line', () => {
  const plain = { dayHijri: { month: 6, day: 20 }, fardDone: 1 };
  for (const weekday of [0, 1, 2, 3, 4, 5, 6]) assert.equal(dayStatus({ ...plain, weekday }), null);
  assert.equal(dayStatus({ weekday: 3, dayHijri: null, hasTimes: false }), null);
  assert.equal(statusOn(2026, 11, 13), null, 'a plain Friday');
  assert.equal(statusOn(2027, 3, 9).tier, 1, 'Eid keeps priority');
  assert.equal(statusOn(2027, 2, 8).tier, 1, 'Ramadan keeps priority');
});

test('Bangla: Bengali digits and no Latin digits in the date lines', () => {
  const cases = [
    dayStatus({ lang: 'bn', dayHijri: { month: 9, day: 5 }, maghribTime: '১৭:১৩' }),
    dayStatus({ lang: 'bn', dayHijri: { month: 9, day: 25 }, nightHijri: { month: 9, day: 25 } }),
    dayStatus({ lang: 'bn', dayHijri: { month: 1, day: 1, year: 1449 } })
  ];
  assert.equal(cases[0].title, '৫ রমজান');
  assert.equal(cases[0].detail, 'রমজান মোবারক · ইফতার মাগরিবে, ১৭:১৩।');
  assert.match(cases[2].title, /১৪৪৯ হিজরি/);
  for (const item of cases) assert.doesNotMatch(item.title + item.detail, /[0-9]/);
});

test("Ja'fari mode avoids Sunni-specific content", () => {
  const shia = extra => dayStatus({ shia: true, ...extra });
  assert.equal(shia({ dayHijri: { month: 9, day: 27 }, nightHijri: { month: 9, day: 27 } }).key, 'last-ten', 'no 27th-night convention');
  assert.doesNotMatch(shia({ dayHijri: { month: 9, day: 23 }, nightHijri: { month: 9, day: 23 } }).detail, /odd/);
  const ramadanNight = shia({ dayHijri: { month: 9, day: 4 }, afterMaghrib: true, ishaTime: '18:31' });
  assert.doesNotMatch(ramadanNight.detail, /Tarawih/);
  assert.match(ramadanNight.detail, /Night prayer and Qur’an after Isha \(18:31\)/);
  assert.doesNotMatch(shia({ dayHijri: { month: 1, day: 10 } }).detail, /fast/i);
  assert.doesNotMatch(shia({ dayHijri: { month: 12, day: 9 } }).detail, /fast/i);
});

test('every date line is short enough for the progress card in both languages', () => {
  for (const lang of ['en', 'bn']) for (let month = 1; month <= 12; month++) for (let day = 1; day <= 30; day++) for (const shia of [false, true]) {
    const status = dayStatus({ lang, shia, dayHijri: { month, day, year: 1448 }, nightHijri: { month, day, year: 1448 }, weekday: 2, maghribTime: '5:13 PM', ishaTime: '6:31 PM', afterMaghrib: day % 2 === 0 });
    if (!status) continue;
    assert.ok(status.title.length <= 40, status.title);
    assert.ok(status.detail.length <= 130, status.detail);
    assert.equal(status.tier, 1);
  }
});

test('the status line is wired: date headline first, then the conversational line; no "A new day"', () => {
  const app = readText('../src/app.js', import.meta.url);
  const html = readText('../index.html', import.meta.url);
  assert.doesNotMatch(app, /A new day/);
  assert.match(app, /const line = status \? null : conversationalLine\(day\);/);
  assert.match(app, /summary\.great \? 'Great Job!' : summary\.good \? 'Good Job!' : status \? status\.title : plainTitle/);
  assert.match(app, /shia: shiaMode\(\)/);
  assert.match(app, /fmt: ms => fmt\(new Date\(ms\)\)/, 'times use the app-wide 12/24-hour formatter');
  assert.match(html, /<p class="progress-status" id="progressStatus" aria-live="polite"><\/p>/);
});

test('the last evening of Ramadan announces Eid instead of Tarawih', () => {
  const eve = dayStatus({ dayHijri: { month: 9, day: 29 }, nightHijri: { month: 10, day: 1 }, afterMaghrib: true, ishaTime: '18:31' });
  assert.equal(eve.key, 'eid-eve');
  assert.doesNotMatch(eve.detail, /Tarawih/);
});
