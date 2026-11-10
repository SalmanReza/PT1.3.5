import test from 'node:test';
import assert from 'node:assert/strict';
import { formatClock, bnDayPeriod, sanitizeClockFormat, CLOCK_FORMATS, DEFAULT_CLOCK_FORMAT } from '../src/time-format.js';
import { readText } from './helpers/read-text.js';

const at = (h, m, s = 0) => new Date(2026, 10, 10, h, m, s);

test('24-hour stays the default and matches the previous en-GB / bn-BD output', () => {
  assert.equal(DEFAULT_CLOCK_FORMAT, '24h');
  assert.deepEqual([...CLOCK_FORMATS], ['24h', '12h']);
  assert.equal(sanitizeClockFormat('xyz'), '24h');
  const en = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  const bn = new Intl.DateTimeFormat('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: false });
  for (let minute = 0; minute < 24 * 60; minute += 7) {
    const date = at(0, minute);
    assert.equal(formatClock(date), en.format(date));
    assert.equal(formatClock(date, { lang: 'bn' }), bn.format(date));
  }
  assert.equal(formatClock(at(17, 5, 9), { seconds: true }), '17:05:09');
});

test('12-hour English: no leading zero, AM/PM, midnight and noon handled', () => {
  const t = (h, m) => formatClock(at(h, m), { clock: '12h' });
  assert.equal(t(0, 0), '12:00 AM');
  assert.equal(t(0, 30), '12:30 AM');
  assert.equal(t(5, 7), '5:07 AM');
  assert.equal(t(11, 59), '11:59 AM');
  assert.equal(t(12, 0), '12:00 PM');
  assert.equal(t(17, 5), '5:05 PM');
  assert.equal(t(23, 59), '11:59 PM');
  assert.equal(formatClock(at(17, 5, 9), { clock: '12h', seconds: true }), '5:05:09 PM');
});

test('12-hour Bangla: Bengali digits with one consistent day-period word', () => {
  const t = (h, m) => formatClock(at(h, m), { lang: 'bn', clock: '12h' });
  assert.equal(t(4, 52), 'ভোর ৪:৫২');
  assert.equal(t(6, 10), 'সকাল ৬:১০');
  assert.equal(t(11, 48), 'সকাল ১১:৪৮');
  assert.equal(t(12, 5), 'দুপুর ১২:০৫');
  assert.equal(t(15, 37), 'বিকাল ৩:৩৭');
  assert.equal(t(17, 13), 'বিকাল ৫:১৩');
  assert.equal(t(18, 31), 'সন্ধ্যা ৬:৩১');
  assert.equal(t(21, 0), 'রাত ৯:০০');
  assert.equal(t(0, 15), 'রাত ১২:১৫');
  for (let h = 0; h < 24; h++) {
    const text = t(h, 0);
    assert.ok(!/[0-9]|AM|PM/.test(text), text);
    assert.equal(text.split(' ')[0], bnDayPeriod(h));
  }
  assert.equal(formatClock(new Date(NaN)), '—');
});

test('one formatter is used for every displayed time, and the setting is saved locally', () => {
  const app = readText('../src/app.js', import.meta.url);
  const html = readText('../index.html', import.meta.url);
  assert.match(app, /function fmt\(date\) \{ return formatClock\(date, \{ lang: lang\(\), clock: state\.clock \}\); \}/);
  assert.match(app, /\$\('liveClock'\)\.textContent = formatClock\(new Date\(\), \{ lang: lang\(\), clock: state\.clock, seconds: true \}\)/);
  assert.doesNotMatch(app, /hour12|toLocaleTimeString|hour: '2-digit'/, 'no other time formatting paths');
  assert.match(app, /clock: sanitizeClockFormat\(saved\.clock\)/);
  assert.match(html, /<select id="clockFormatSelect"><option value="24h">24-hour \(17:05\)<\/option><option value="12h">12-hour \(5:05 PM\)<\/option><\/select>/);
  assert.match(app, /'12-hour \(5:05 PM\)':'১২ ঘণ্টা \(বিকাল ৫:০৫\)'/);
});
