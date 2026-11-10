import test from 'node:test';
import assert from 'node:assert/strict';
import { REFLECTIONS, reflectionFor, reflectionIndex, dayOfYear, sourceLabel } from '../src/daily-reflections.js';
import { dayStatus } from '../src/day-status.js';
import { readText } from './helpers/read-text.js';

const CODES = new Set(['', 'B', 'M', 'BM', 'T', 'N', 'ADT', 'TN', 'ADN']);

test('365 entries, all unique, each with English, Bangla and a known source', () => {
  assert.equal(REFLECTIONS.length, 365);
  assert.equal(new Set(REFLECTIONS.map(r => r[0].toLowerCase())).size, 365, 'English lines are unique');
  assert.equal(new Set(REFLECTIONS.map(r => r[1])).size, 365, 'Bangla lines are unique');
  for (const [en, bn, code] of REFLECTIONS) {
    assert.ok(en.trim() && bn.trim(), en);
    assert.ok(en.length <= 70, `English too long (${en.length}): ${en}`);
    assert.ok(bn.length <= 80, `Bangla too long (${bn.length}): ${bn}`);
    assert.match(bn, /[\u0980-\u09FF]/, `Bangla text present: ${bn}`);
    assert.doesNotMatch(bn, /[0-9]/, 'Bangla uses Bengali digits');
    assert.doesNotMatch(bn, /[\u0900-\u0963\u0966-\u097F]/, 'no stray Devanagari (the danda । is shared)');
    assert.ok(CODES.has(code) || /^Q\d{1,3}:\d{1,3}(-\d{1,3})?$/.test(code), `source code ${code}`);
    if (code.startsWith('Q')) {
      const [surah, ayah] = code.slice(1).split(':').map(part => parseInt(part, 10));
      assert.ok(surah >= 1 && surah <= 114 && ayah >= 1, code);
    }
  }
  const quran = REFLECTIONS.filter(r => r[2].startsWith('Q')).length;
  const hadith = REFLECTIONS.filter(r => r[2] && !r[2].startsWith('Q')).length;
  const reminders = REFLECTIONS.filter(r => !r[2]).length;
  assert.deepEqual([quran, hadith, reminders], [200, 140, 25]);
});

test('source labels are bilingual with Bengali digits', () => {
  assert.equal(sourceLabel('Q2:152'), 'Qur’an 2:152');
  assert.equal(sourceLabel('Q20:25-26', 'bn'), 'কুরআন ২০:২৫-২৬');
  assert.equal(sourceLabel('BM'), 'Bukhari & Muslim');
  assert.equal(sourceLabel('ADT', 'bn'), 'আবু দাউদ ও তিরমিজি');
  assert.equal(sourceLabel(''), '');
});

test('selection is by day of year: deterministic, different every day of a year', () => {
  assert.equal(dayOfYear(new Date(2026, 0, 1)), 0);
  assert.equal(dayOfYear(new Date(2026, 11, 31)), 364);
  assert.equal(dayOfYear(new Date(2028, 11, 31)), 365);
  assert.equal(reflectionIndex(new Date(2028, 11, 31)), 0, 'leap-year 31 Dec wraps');
  const seen = new Set();
  for (let d = 0; d < 365; d++) seen.add(reflectionFor(new Date(2027, 0, 1 + d)).text);
  assert.equal(seen.size, 365);
  // Same civil date, any time of day / DST hour, any year: same line.
  for (const [h, m] of [[0, 0], [1, 30], [12, 0], [23, 59]]) assert.equal(reflectionIndex(new Date(2026, 2, 29, h, m)), reflectionIndex(new Date(2027, 2, 29)));
  assert.equal(reflectionIndex(new Date(2026, 9, 25, 2, 30)), dayOfYear(new Date(2026, 9, 25)));
  assert.deepEqual(reflectionFor(new Date(2026, 0, 1), 'bn'), { text: REFLECTIONS[0][1], source: 'কুরআন ২:১৫২', code: 'Q2:152' });
});

test('the progress card shows no reflection; each day has one "Daily reflection" slide in the Sunnah & Seerah carousel', () => {
  const app = readText('../src/app.js', import.meta.url);
  const css = readText('../src/styles.css', import.meta.url);
  const html = readText('../index.html', import.meta.url);
  assert.doesNotMatch(html, /progressReflection/);
  assert.doesNotMatch(css, /progress-reflection/);
  assert.doesNotMatch(app, /reflection: reflectionFor/);
  assert.match(app, /slides\.push\(\{ key: 'daily-reflection'/);
  assert.match(app, /bn \? 'আজকের ভাবনা' : 'Daily reflection'/);
  assert.match(app, /renderCarousel\(box, 'seerah-glimpses', slides, 'Seerah glimpses'\)/);
  assert.match(app, /reflectionFor\(progressDate\(new Date\(\)\), lang\(\)\)/);
  assert.equal(dayStatus({ weekday: 2, hasTimes: false }), null, 'day-status no longer carries a reflection tier');
});
