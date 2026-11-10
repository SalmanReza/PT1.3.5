import test from 'node:test';
import assert from 'node:assert/strict';
import { cardCountdown, durationText, minutesLeft } from '../src/card-countdown.js';
import { readText } from './helpers/read-text.js';

const M = 60000, H = 60 * M, T = Date.UTC(2026, 10, 10, 0, 0, 0);
const c = (nowMin, startMin, endMin, lang = 'en') => cardCountdown({ now: T + nowMin * M, start: T + startMin * M, end: T + endMin * M, lang });

test('not started: "in 3h 54m"; hours-only and minutes-only are trimmed', () => {
  assert.deepEqual(c(0, 234, 400), { kind: 'upcoming', text: 'in 3h 54m' });
  assert.equal(c(0, 120, 400).text, 'in 2h');
  assert.equal(c(0, 25, 400).text, 'in 25m');
  assert.equal(c(0, 0.2, 400).text, 'in 1m', 'under a minute rounds up, never "0m"');
});

test('current: "ends in 25m", with hours when needed', () => {
  assert.deepEqual(c(10, 0, 35), { kind: 'current', text: 'ends in 25m' });
  assert.equal(c(10, 0, 195).text, 'ends in 3h 5m');
  assert.equal(c(0, 0, 60).kind, 'current', 'the start second is inside the window');
});

test('passed: no line, including the exact end second', () => {
  assert.deepEqual(c(60, 0, 60), { kind: 'passed', text: '' });
  assert.deepEqual(c(500, 0, 60), { kind: 'passed', text: '' });
  assert.deepEqual(cardCountdown({ now: NaN, start: 0, end: 1 }), { kind: 'passed', text: '' });
});

test('seconds never appear and the text is stable within a minute', () => {
  assert.equal(c(0, 234, 400).text, cardCountdown({ now: T + 20 * 1000, start: T + 234 * M, end: T + 400 * M }).text.replace('3h 54m', '3h 54m'));
  assert.ok(!/s\b/.test(c(0, 234.5, 400).text.replace('in ', '')) );
});

test('Bangla is natural, with Bengali digits', () => {
  assert.equal(c(0, 234, 400, 'bn').text, '৩ ঘণ্টা ৫৪ মিনিট পরে');
  assert.equal(c(10, 0, 35, 'bn').text, '২৫ মিনিটে শেষ');
  assert.equal(c(0, 120, 400, 'bn').text, '২ ঘণ্টা পরে');
  assert.equal(c(0, 0, 120, 'bn').text, '২ ঘণ্টায় শেষ');
  assert.equal(c(0, 0, 65, 'bn').text, '১ ঘণ্টা ৫ মিনিটে শেষ');
  assert.equal(durationText(0, 'en'), '0m');
  assert.equal(minutesLeft(0), 0);
});

test('wiring: a line under the Qur\'an/hadith note of each of the five cards, refreshed on render and every 15 s tick', () => {
  const app = readText('../src/app.js', import.meta.url);
  assert.match(app, /\$\{prayerNoteHtml\(prayer\.key\)\}<div class="prayer-eta" data-eta="\$\{prayer\.key\}" hidden><\/div>/);
  assert.match(app, /function updateCardCountdowns\(now = new Date\(\)\)/);
  assert.match(app, /updateCardCountdowns\(\);\n\}/, 'called at the end of renderFard');
  assert.match(app, /renderProgress\(\);\n\s+updateCardCountdowns\(\);/, 'refreshed by the interval');
  assert.match(app, /dateKey\(selectedDate\) === dateKey\(today\)/, 'only for today');
});
