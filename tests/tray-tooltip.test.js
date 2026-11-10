import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { minutesLeft, formatRemaining, trayTooltipText, TRAY_TOOLTIP_MAX } from '../src/tray-tooltip.js';
import { readText } from './helpers/read-text.js';

const app = readText('../src/app.js', import.meta.url);
const rust = readText('../src-tauri/src/main.rs', import.meta.url);
const caps = JSON.parse(readText('../src-tauri/capabilities/default.json', import.meta.url));

test('remaining time rounds up to whole minutes and never reads 0m', () => {
  assert.equal(minutesLeft(0), 0);
  assert.equal(minutesLeft(1), 1);
  assert.equal(minutesLeft(60000), 1);
  assert.equal(minutesLeft(60001), 2);
  assert.equal(formatRemaining(30000), '1m');
  assert.equal(formatRemaining(23 * 60000), '23m');
  assert.equal(formatRemaining((83 * 60 - 5) * 1000), '1h 23m');
  assert.equal(formatRemaining(120 * 60000), '2h');
});

test('English and Bangla tooltip text, Bengali digits in Bangla', () => {
  assert.equal(trayTooltipText({ name: 'Asr', ms: 83 * 60000, lang: 'en' }), 'Prayer Times\nAsr in 1h 23m');
  assert.equal(trayTooltipText({ name: 'আসর', ms: 83 * 60000, lang: 'bn' }), 'নামাজের সময়\nআসর শুরু হতে ১ ঘণ্টা ২৩ মিনিট বাকি');
  assert.equal(trayTooltipText({ name: 'ফজর', ms: 5 * 60000, lang: 'bn' }), 'নামাজের সময়\nফজর শুরু হতে ৫ মিনিট বাকি');
  assert.doesNotMatch(trayTooltipText({ name: 'আসর', ms: 600 * 60000, lang: 'bn' }), /[0-9]/);
  assert.equal(trayTooltipText({ lang: 'en' }), 'Prayer Times');
  assert.equal(trayTooltipText({ lang: 'bn' }), 'নামাজের সময়');
  assert.ok(trayTooltipText({ name: 'x'.repeat(300), ms: 60000 }).length <= TRAY_TOOLTIP_MAX);
});

test('tray tooltip is wired cheaply and the tray keeps its menu', () => {
  assert.match(rust, /TrayIconBuilder::with_id\("main"\)/);
  assert.match(rust, /\.menu\(&menu\)/);
  assert.match(rust, /"open" =>/);
  assert.match(rust, /"exit" => app\.exit\(0\)/);
  assert.ok(caps.permissions.includes('core:tray:allow-set-tooltip'));
  assert.ok(caps.permissions.includes('core:tray:allow-get-by-id'));
  assert.match(app, /TrayIcon\.getById\('main'\)/);
  assert.match(app, /if \(text === lastTrayTooltip\) return;/);
  assert.match(app, /checkNotifications\(\);\n    updateTrayTooltip\(\);\n  \}, 15000\);/);
  assert.match(app, /window\.__TAURI_INTERNALS__/);
});

test('v1.3.3: the tray tooltip counts down to the next obligatory prayer and never to a forbidden interval', () => {
  const app = readText('../src/app.js', import.meta.url);
  const fn = app.slice(app.indexOf('function updateTrayTooltip'), app.indexOf('function updateTrayTooltip') + 400);
  assert.match(fn, /getNextPrayer\(now\)/);
  assert.doesNotMatch(fn, /prohibit|forbidden|interval/i);
});
