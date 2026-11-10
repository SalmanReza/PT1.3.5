import test from 'node:test';
import assert from 'node:assert/strict';
import { nextPrayerEventAfter, activeIntervals } from '../src/interval-rows.js';
import { readText } from './helpers/read-text.js';

const m = 60000, T = Date.UTC(2026, 10, 13, 0, 0, 0), at = h => T + h * 3600000;
const TL = [
  { kind: 'fard', key: 'fajr', at: at(4.87) }, { kind: 'prohibited-start', key: 'sunrise', at: at(6.17) }, { kind: 'prohibited-end', key: 'sunrise', at: at(6.5) },
  { kind: 'voluntary', key: 'duha', at: at(6.5) }, { kind: 'prohibited-start', key: 'zawal', at: at(11.7) }, { kind: 'prohibited-end', key: 'zawal', at: at(11.8) },
  { kind: 'fard', key: 'dhuhr', at: at(11.8) }, { kind: 'fard', key: 'asr', at: at(15.3) }, { kind: 'prohibited-start', key: 'sunset', at: at(16.9) }, { kind: 'fard', key: 'maghrib', at: at(17.2) }
];
const IV = [{ key: 'sunrise', start: at(6.17), end: at(6.5) }, { key: 'zawal', start: at(11.7), end: at(11.8) }, { key: 'sunset', start: at(16.9), end: at(17.2) }];

test('the next prayer event skips prohibited-interval entries and midnight', () => {
  assert.equal(nextPrayerEventAfter(TL, at(6.3)).key, 'duha');
  assert.equal(nextPrayerEventAfter(TL, at(11.75)).key, 'dhuhr');
  assert.equal(nextPrayerEventAfter(TL, at(17.5)), null);
  assert.equal(nextPrayerEventAfter([{ kind: 'midnight', at: at(1) }], at(0)), null);
});

test('activeIntervals returns only intervals in progress: no lead time, nothing upcoming (v1.3.3)', () => {
  // five minutes before Zawal (the retired "5 min before" rule), and hours before sunrise: nothing
  assert.deepEqual(activeIntervals(IV, at(11.7) - 5 * m), []);
  assert.deepEqual(activeIntervals(IV, at(5.5)), []);
  assert.deepEqual(activeIntervals(IV, at(6.0)), []);
  // exact start second is active; the exact end second is not
  assert.deepEqual(activeIntervals(IV, at(6.17)).map(r => r.key), ['sunrise']);
  assert.deepEqual(activeIntervals(IV, at(6.5)), []);
  assert.deepEqual(activeIntervals(IV, at(11.75)).map(r => [r.key, r.active]), [['zawal', true]]);
  assert.deepEqual(activeIntervals(IV, at(11.8)), []);
  assert.deepEqual(activeIntervals(IV, at(17.19)).map(r => r.key), ['sunset']);
  assert.deepEqual(activeIntervals(null, at(1)), []);
});

test('a prohibited interval is never the Next event: Next event is the soonest prayer event at every minute of the day', () => {
  for (let min = 0; min < 24 * 60; min++) {
    const now = at(0) + min * m;
    const next = nextPrayerEventAfter(TL, now);
    assert.ok(!next || next.kind === 'fard' || next.kind === 'voluntary');
    const soonestPrayer = TL.filter(e => e.at > now && (e.kind === 'fard' || e.kind === 'voluntary')).sort((x, y) => x.at - y.at)[0] || null;
    assert.equal(next, soonestPrayer);
  }
  // inside Zawal the hero targets Dhuhr (the prayer), not the end of Zawal
  assert.equal(nextPrayerEventAfter(TL, at(11.75)).key, 'dhuhr');
});

test('wiring: the forbidden card appears only while active, switches the section heading, and Next event uses prayer events only', () => {
  const app = readText('../src/app.js', import.meta.url);
  const css = readText('../src/styles.css', import.meta.url);
  const html = readText('../index.html', import.meta.url);
  const live = app.slice(app.indexOf('function renderLiveEvents'));
  assert.match(app, /return activeIntervals\(\[-1, 0, 1\]\.flatMap/, 'only intervals in progress');
  assert.match(app, /const forbidden = activeProhibited\(new Date\(\)\);/);
  assert.match(app, /heading\.textContent = liveHeadingText\(forbidden\)/);
  assert.match(app, /Forbidden time/);
  assert.match(app, /নিষিদ্ধ সময়/);
  assert.match(app, /Praying is not allowed until \$\{until\}/);
  assert.match(app, /\$\{until\} পর্যন্ত নামাজ পড়া নিষেধ/);
  assert.match(app, /'ENDS IN'/);
  assert.match(app, /FORBIDDEN TIME/);
  assert.match(app, /role="status" data-prohibited/);
  assert.match(app, /const next = nextPrayerEventAfter\(timeline, now\);/, 'Next event = soonest prayer event');
  assert.doesNotMatch(app, /nextEventAfter\(/, 'the hero never targets an interval or midnight');
  assert.doesNotMatch(app, /is-upcoming|Begins \$\{range\}|intervalsBefore|intervalRowsHtml/, 'no upcoming interval card');
  assert.ok(html.indexOf('id="liveHeading"') > 0 && html.indexOf('live-events-section') < html.indexOf('class="hero-grid"'));
  assert.match(css, /\.forbidden-card \{/);
  assert.match(css, /--forbidden: color-mix\(in srgb, var\(--accent\)/, 'violet derived from theme tokens');
  assert.ok(live.indexOf("insertAdjacentHTML('afterbegin', intervalRows)") > 0 || /box\.innerHTML = intervalRows \|\|/.test(live));
});
