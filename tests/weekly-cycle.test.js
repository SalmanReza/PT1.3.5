import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fridayCycleStart, sevenCycleDates, weekStart, weeklyFardTally, fardSlotDone, isFridayDhuhr, FRIDAY_DHUHR_LABEL, WEEK_DAY_LABELS } from '../src/weekly-cycle.js';
import { readText } from './helpers/read-text.js';

const app = readText('../src/app.js', import.meta.url);
const html = readText('../index.html', import.meta.url);
const readme = readText('../README.md', import.meta.url);

test('the week runs Saturday to Friday as seven full calendar days', () => {
  // Tue 10 Nov 2026 → week of Sat 7 Nov … Fri 13 Nov.
  const start = weekStart(new Date(2026, 10, 10, 15, 0));
  assert.equal(start.getDay(), 6);
  assert.equal(start.getDate(), 7);
  assert.equal(start.getHours(), 0);
  assert.equal(weekStart(new Date(2026, 10, 7, 0, 0)).getDate(), 7, 'Saturday starts its own week');
  assert.equal(weekStart(new Date(2026, 10, 13, 23, 59)).getDate(), 7, 'Friday closes the week, all day long');
  assert.equal(weekStart(new Date(2026, 10, 14, 0, 0)).getDate(), 14);
  const days = sevenCycleDates(start);
  assert.deepEqual(days.map(day => day.getDay()), [6, 0, 1, 2, 3, 4, 5]);
  assert.deepEqual(WEEK_DAY_LABELS.en, ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  assert.equal(WEEK_DAY_LABELS.bn[6], 'শুক্র');
});

test('every day, Friday included, has five Fard cells: 35 per week', () => {
  const dates = sevenCycleDates(weekStart(new Date(2026, 10, 10)));
  const records = {};
  const friday = dates[6];
  records[friday.toDateString()] = { fard: { fajr: true, dhuhr: true, asr: true } };
  records[dates[0].toDateString()] = { fard: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true } };
  const tally = weeklyFardTally(dates, date => records[date.toDateString()]);
  assert.equal(tally.possible, 35);
  assert.equal(tally.done, 8);
  for (const day of tally.days) assert.equal(day.cells.length, 5);
  assert.deepEqual(tally.days[6].cells.map(cell => cell.friday), [false, true, false, false, false]);
  assert.equal(tally.days[6].count, 3);
});

test('Friday’s slot is labelled Dhuhr/Jumu’ah and either prayer completes it', () => {
  assert.equal(FRIDAY_DHUHR_LABEL.en, 'Dhuhr/Jumu’ah');
  assert.equal(FRIDAY_DHUHR_LABEL.bn, 'যোহর/জুমা');
  const friday = new Date(2026, 10, 13);
  const tuesday = new Date(2026, 10, 10);
  assert.equal(isFridayDhuhr('dhuhr', friday), true);
  assert.equal(isFridayDhuhr('dhuhr', tuesday), false);
  assert.equal(fardSlotDone({ dhuhr: true }, 'dhuhr', friday), true);
  assert.equal(fardSlotDone({ jumuah: true }, 'dhuhr', friday), true, 'legacy Jumu’ah key counts');
  assert.equal(fardSlotDone({ jumuah: true }, 'dhuhr', tuesday), false);
  // Used everywhere the Friday midday slot appears.
  assert.match(app, /function slotName\(key, date\)/);
  assert.match(app, /const displayName = slotName\(event\.key, event\.date\);/);
  assert.match(app, /prayerName: key => slotName\(key, next\.date\)/);
  assert.match(app, /referenceCardHtml\(key, slotName\(key, selectedDate\)\)/);
  assert.match(app, /return slotName\(event\.key, event\.date\);/);
  assert.doesNotMatch(app, /'Jumu’ah \/ Dhuhr'/);
});

test('history stays compatible: legacy records are copied, never removed', () => {
  assert.match(app, /record\.fard\.jumuah && !record\.fard\.dhuhr\) record\.fard\.dhuhr = true/);
  assert.doesNotMatch(app, /delete record\.fard/);
});

test('weekly view: Fard and Nafl separate, Friday highlighted, today marked, bilingual', () => {
  assert.match(app, /WEEKLY FARD/);
  assert.match(app, /WEEKLY NAFL/);
  assert.match(app, /সাপ্তাহিক ফরজ/);
  assert.match(app, /সাপ্তাহিক নফল/);
  assert.match(app, /\$\{friday \? ' friday' : ''\}/);
  assert.match(app, /\$\{isToday \? ' today' : ''\}/);
  assert.match(app, /class="week-figure"/);
  assert.match(app, /figureSvg\(layers\.flags, \{ mini: true \}\)/);
  assert.match(html, /Saturday to Friday/);
  assert.doesNotMatch(app, /anchorDhuhr/);
  assert.doesNotMatch(readme, /33 opportunities/);
});

test('legacy Friday-Dhuhr boundary helper is kept for compatibility', () => {
  const getDhuhr = date => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  assert.equal(fridayCycleStart(new Date(2026, 10, 13, 11, 59), getDhuhr).getDate(), 6);
  assert.equal(fridayCycleStart(new Date(2026, 10, 13, 12, 1), getDhuhr).getDate(), 13);
});
