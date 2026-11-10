import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readText } from './helpers/read-text.js';

const app = readText('../src/app.js', import.meta.url);
const html = readText('../index.html', import.meta.url);

test('end-time reminder choices include all requested intervals for every event type', () => {
  assert.match(app, /const options = \[0, 5, 10, 15, 20, 30, 40, 50, 60\]/);
  assert.ok(app.includes('[...FARD, ...REMINDER_VOLUNTARY]'));
  assert.match(app, /VOLUNTARY\.filter\(item => item\.key !== 'rawatib'\)/);
  assert.match(html, /id="eventReminderSettings"/);
});

test('reminders are calculated from event end, deduplicated and suppressed after completion', () => {
  assert.match(app, /event\.end\.getTime\(\) - leadMinutes \* 60000/);
  assert.match(app, /state\.reminderSent\[id\]/);
  assert.match(app, /record\[event\.kind\]\?\.\[event\.key\]/);
  assert.match(app, /getVoluntaryEvents\(date, times, nextTimes\)/);
});

test('reminder configuration and sent markers persist locally', () => {
  assert.match(app, /reminders: saved\.reminders/);
  assert.match(app, /reminderSent: saved\.reminderSent/);
  assert.match(app, /localStorage\.setItem\('prayer-times-data'/);
});
