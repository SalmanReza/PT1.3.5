import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseReminderMinutes, sanitizeReminderMap, isReminderDue, preReminderFireAt, REMINDER_GRACE_MS, PRE_REMINDER_MAX } from '../src/reminder-schedule.js';
import { readText } from './helpers/read-text.js';

const app = readText('../src/app.js', import.meta.url);
const html = readText('../index.html', import.meta.url);

test('minutes input accepts any whole number 0–180 and rejects the rest', () => {
  assert.equal(PRE_REMINDER_MAX, 180);
  assert.equal(parseReminderMinutes(''), 0);
  assert.equal(parseReminderMinutes('0'), 0);
  assert.equal(parseReminderMinutes('7'), 7);
  assert.equal(parseReminderMinutes(' 37 '), 37);
  assert.equal(parseReminderMinutes('180'), 180);
  for (const bad of ['181', '-5', '2.5', 'abc', '1e2', '10m']) assert.equal(parseReminderMinutes(bad), null, bad);
});

test('stored values are sanitised to the five prayers and valid minutes', () => {
  assert.deepEqual(sanitizeReminderMap({ fajr: 12, asr: '45', isha: 999, dhuhr: 0, extra: 5 }, ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']), { fajr: 12, asr: 45 });
  assert.deepEqual(sanitizeReminderMap(null, ['fajr']), {});
});

test('due window: from the offset, survives throttled ticks, never at or after the start', () => {
  const start = new Date(2026, 10, 10, 15, 30);
  const fireAt = preReminderFireAt(start, 10);
  assert.equal(start.getTime() - fireAt, 600000);
  assert.equal(isReminderDue(fireAt - 1, fireAt, start.getTime()), false);
  assert.equal(isReminderDue(fireAt, fireAt, start.getTime()), true);
  assert.equal(isReminderDue(fireAt + 61000, fireAt, start.getTime()), true);
  assert.equal(isReminderDue(fireAt + REMINDER_GRACE_MS, fireAt, start.getTime()), false);
  const late = preReminderFireAt(start, 1);
  assert.equal(isReminderDue(start.getTime(), late, start.getTime()), false);
  assert.equal(isReminderDue(start.getTime() - 1000, late, start.getTime()), true);
});

test('one per prayer per day, behind the notification toggle, bilingual', () => {
  assert.match(app, /if \(!state\.notifications \|\| !liveTimes \|\| !hasLocation\(\)\) return;/);
  assert.match(app, /`\$\{dateKey\(event\.date\)\}:\$\{event\.key\}:before`/);
  assert.match(app, /if \(!isReminderDue\(now, fireAt, startAt\) \|\| state\.reminderSent\[id\]\) continue;/);
  assert.match(app, /মিনিট পরে/);
  assert.match(app, /begins at \$\{fmt\(event\.start\)\}/);
  assert.match(app, /preReminders: sanitizeReminderMap\(saved\.preReminders/);
  assert.match(app, /preReminders: \{\}, reminderSent: \{\}/);
  assert.match(html, /id="preReminderSettings"/);
  assert.match(app, /type="number" inputmode="numeric" min="0" max="\$\{PRE_REMINDER_MAX\}" step="1"/);
  // Existing end-of-period reminders stay, now with Bengali digits in Bangla.
  assert.match(app, /আর \$\{localizeDigits\(leadMinutes\)\} মিনিট বাকি/);
  assert.match(app, /isReminderDue\(now, fireAt, event\.end\.getTime\(\)\)/);
});

test('notification sending: native command first, plugin fallback tolerating no Promise, failed sends are forgotten (retried)', () => {
  assert.match(app, /async function deliverNotification\(title, body\)/);
  assert.match(app, /await invoke\('notify_native', \{ title, body \}\)/);
  assert.match(app, /if \(result && typeof result\.then === 'function'\) await result;/, 'the plugin returns no Promise');
  assert.doesNotMatch(app, /sendNotification\(\{ title, body \}\)\.catch/);
  assert.match(app, /function sendReminder\(id, title, body\)/);
  assert.match(app, /deliverNotification\(title, body\)\.then\(result => \{ if \(!result\.ok\) forget\(\); \}, forget\);/);
});
