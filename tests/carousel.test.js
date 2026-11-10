import test from 'node:test';
import assert from 'node:assert/strict';
import { wrapIndex, stepIndex, counterLabel, showsControls, reconcileIndex, toBengaliDigits } from '../src/carousel.js';
import { historyItemsFor, quranItemsFor, glimpsesFor } from '../src/daily-content.js';
import { HIJRI_DAY_NOTES, ISLAMIC_HISTORY_EVENTS, QURAN_REVELATION_RECORDS } from '../src/islamic-content.js';
import { readText } from './helpers/read-text.js';

test('paging wraps around in both directions', () => {
  assert.equal(stepIndex(0, 1, 5), 1);
  assert.equal(stepIndex(4, 1, 5), 0);
  assert.equal(stepIndex(0, -1, 5), 4);
  assert.equal(wrapIndex(7, 5), 2);
  assert.equal(wrapIndex(3, 0), 0);
});

test('counter reads 1 / 5 in English and uses Bengali digits in Bangla', () => {
  assert.equal(counterLabel(0, 5, 'en'), '1 / 5');
  assert.equal(counterLabel(4, 5, 'en'), '5 / 5');
  assert.equal(counterLabel(1, 12, 'bn'), '২ / ১২');
  assert.equal(toBengaliDigits('2026'), '২০২৬');
  assert.equal(counterLabel(0, 0, 'en'), '');
});

test('controls are hidden for a single item', () => {
  assert.equal(showsControls(1), false);
  assert.equal(showsControls(0), false);
  assert.equal(showsControls(2), true);
});

test('the visible page survives a re-render but resets when the items change', () => {
  assert.equal(reconcileIndex({ signature: 'a|b|c', index: 2 }, 'a|b|c', 3), 2);
  assert.equal(reconcileIndex({ signature: 'a|b|c', index: 2 }, 'a|d', 2), 0);
  assert.equal(reconcileIndex(undefined, 'a', 1), 0);
});

test('Islamic history shows every match for the date, exact first, then month-level', () => {
  const ashura = historyItemsFor({ month: 1, day: 10 }, HIJRI_DAY_NOTES, ISLAMIC_HISTORY_EVENTS);
  assert.ok(ashura.length >= 3, `expected several items, got ${ashura.length}`);
  assert.equal(ashura.filter(item => item.type === 'note').length, 0, 'the Ashura note is not duplicated beside the Ashura event');
  assert.ok(ashura.slice(0, 2).every(item => item.match === 'exact'));
  assert.ok(ashura.some(item => item.match === 'month' && /Baghdad/.test(item.item.title)));
  const rajab27 = historyItemsFor({ month: 7, day: 27 }, HIJRI_DAY_NOTES, ISLAMIC_HISTORY_EVENTS);
  assert.equal(rajab27[0].type, 'note');
  assert.ok(rajab27.some(item => /Jerusalem/.test(item.item.title)));
  const keys = rajab27.map(item => item.key);
  assert.equal(new Set(keys).size, keys.length, 'no duplicate slides');
});

test('Islamic history falls back to the nearest anniversary only when nothing matches', () => {
  const items = historyItemsFor({ month: 2, day: 14 }, HIJRI_DAY_NOTES, ISLAMIC_HISTORY_EVENTS);
  assert.ok(items.length >= 1);
  assert.ok(items.every(item => item.match !== 'exact'));
  assert.deepEqual(historyItemsFor(null, HIJRI_DAY_NOTES, ISLAMIC_HISTORY_EVENTS), []);
});

test('Qur’anic verse matching keeps exact day before month-level and supports multiple items', () => {
  const ramadan = quranItemsFor({ month: 9, day: 5 }, QURAN_REVELATION_RECORDS);
  assert.ok(ramadan.length >= 3);
  assert.ok(ramadan.every(item => item.matchLevel === 'month'));
  const arafah = quranItemsFor({ month: 12, day: 9 }, QURAN_REVELATION_RECORDS);
  assert.equal(arafah[0].matchLevel, 'day');
  assert.match(arafah[0].record.verse.reference, /5:3/);
  const shaban = quranItemsFor({ month: 8, day: 1 }, QURAN_REVELATION_RECORDS);
  assert.ok(shaban.some(item => item.record.id === 'change-of-qibla'));
  const safar = quranItemsFor({ month: 2, day: 10 }, QURAN_REVELATION_RECORDS);
  assert.deepEqual(safar.map(item => item.record.id), ['hijrah-the-cave']);
  const jumada = quranItemsFor({ month: 5, day: 30 }, QURAN_REVELATION_RECORDS);
  assert.ok(jumada.length >= 1 && jumada.every(item => item.matchLevel === 'nearest'));
  // A day-specific record matches its own day only, not the whole month.
  assert.ok(!quranItemsFor({ month: 12, day: 1 }, QURAN_REVELATION_RECORDS).some(item => item.record.id === 'perfection-of-religion-arafah' && item.matchLevel !== 'nearest'));
  assert.ok(!quranItemsFor({ month: 9, day: 5 }, QURAN_REVELATION_RECORDS).some(item => item.record.id === 'badr-help-answered'));
  const badr = quranItemsFor({ month: 9, day: 17 }, QURAN_REVELATION_RECORDS);
  assert.equal(badr[0].record.id, 'badr-help-answered');
  assert.equal(badr[0].matchLevel, 'day');
  assert.ok(badr.length >= 4, 'exact day plus every Ramadan month-level record');
  for (const item of quranItemsFor({ month: 9, day: 27 }, QURAN_REVELATION_RECORDS)) {
    assert.equal(typeof item.record.verse.arabic, 'string', 'one verse per slide');
  }
});

test('every history and verse record is bilingual, sourced and date-qualified', () => {
  for (const event of ISLAMIC_HISTORY_EVENTS) {
    assert.ok(event.title && event.bn && event.detail && event.detailBn && event.dateLabel && event.dateLabelBn && event.source, event.title);
    assert.ok(event.month >= 1 && event.month <= 12);
    if (event.day === null || event.day === undefined) assert.equal(event.precision, 'month', `${event.title} must be labelled month-level`);
  }
  for (const record of QURAN_REVELATION_RECORDS) {
    assert.ok(record.id && record.title && record.titleBn && record.context && record.contextBn && record.source, record.id);
    assert.ok(record.verse.arabic && record.verse.translation && record.verse.translationBn && /\d+:\d+/.test(record.verse.reference), record.id);
    assert.ok(record.suggestion && record.suggestionBn, record.id);
  }
});

test('Seerah glimpses: only the genuine matches for the weekday, never padded', () => {
  const glimpses = [{ t: 0 }, { t: 1, weekday: 1 }, { t: 2 }, { t: 3 }, { t: 4 }, { t: 5, weekday: 5 }, { t: 6 }];
  assert.deepEqual(glimpsesFor(1, glimpses), [1]);
  assert.deepEqual(glimpsesFor(3, glimpses), [3]);
  // A second Friday entry anywhere in the list also matches Friday: counts follow the data.
  const more = [...glimpses, { t: 7, weekday: 5 }, { t: 8, weekday: 5 }];
  assert.deepEqual(glimpsesFor(5, more), [5, 7, 8]);
  assert.deepEqual(glimpsesFor(2, more), [2]);
  // Regression: v1.2.9 appended every general glimpse, so most days showed exactly five.
  for (let day = 0; day < 7; day++) assert.notEqual(glimpsesFor(day, glimpses).length, 5);
});

test('all four daily cards and date-specific prayers are rendered as carousels without network access', async () => {
  const fs = await import('node:fs');
  const app = readText('../src/app.js', import.meta.url);
  for (const id of ['islamic-history', 'quran-verses', 'sunnah-observance', 'seerah-glimpses', 'seasonal-descriptions']) assert.ok(app.includes(`'${id}'`), `missing ${id} carousel`);
  assert.match(app, /voluntary-date-specific:/);
  assert.match(app, /data-carousel-step="-1" aria-label="Previous item">‹/);
  assert.match(app, /data-carousel-step="1" aria-label="Next item">›/);
  assert.ok(app.includes("'Previous item':'আগেরটি'") && app.includes("'Next item':'পরেরটি'"));
  for (const file of ['app.js', 'daily-content.js', 'carousel.js', 'islamic-content.js', 'sound.js', 'progress-figure.js', 'keyboard.js', 'branding.js']) {
    const source = readText(`../src/${file}`, import.meta.url);
    assert.doesNotMatch(source, /\bfetch\(|XMLHttpRequest|WebSocket\(|navigator\.sendBeacon/, `${file} must stay offline`);
  }
});

test('carousel counts follow the genuine matches and vary by date (no fixed count, no cap)', () => {
  const dates = [[1, 10], [2, 27], [5, 20], [5, 30], [7, 27], [9, 17], [9, 21], [10, 1], [11, 20], [12, 9]];
  const historyCounts = dates.map(([month, day]) => historyItemsFor({ month, day }, HIJRI_DAY_NOTES, ISLAMIC_HISTORY_EVENTS).length);
  const verseCounts = dates.map(([month, day]) => quranItemsFor({ month, day }, QURAN_REVELATION_RECORDS).length);
  assert.ok(new Set(historyCounts).size >= 3, `history counts should vary: ${historyCounts}`);
  assert.ok(new Set(verseCounts).size >= 3, `verse counts should vary: ${verseCounts}`);
  assert.ok(Math.max(...historyCounts) >= 5 && Math.min(...historyCounts) >= 1);
  // Every exact-day and month-level event for a date is present (nothing dropped or capped).
  for (const [month, day] of dates) {
    const keys = historyItemsFor({ month, day }, HIJRI_DAY_NOTES, ISLAMIC_HISTORY_EVENTS).map(item => item.key);
    const expected = ISLAMIC_HISTORY_EVENTS.filter(event => event.month === month && (event.day === day || event.day === null || event.day === undefined));
    for (const event of expected) assert.ok(keys.includes(`event:${event.title}`), `${month}-${day} missing ${event.title}`);
  }
});

test('expanded history data is dense across the Hijri year', () => {
  assert.ok(ISLAMIC_HISTORY_EVENTS.length >= 40);
  assert.ok(QURAN_REVELATION_RECORDS.length >= 13);
  for (let month = 1; month <= 12; month++) assert.ok(ISLAMIC_HISTORY_EVENTS.some(event => event.month === month), `no history entry in month ${month}`);
  const titles = ISLAMIC_HISTORY_EVENTS.map(event => event.title);
  assert.equal(new Set(titles).size, titles.length, 'duplicate titles');
  const ids = QURAN_REVELATION_RECORDS.map(record => record.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate verse ids');
});
