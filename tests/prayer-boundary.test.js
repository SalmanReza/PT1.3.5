import test from 'node:test';
import assert from 'node:assert/strict';
import { nextBoundary, needsRefresh, boundaryDelay, TICK_GAP_MS } from '../src/prayer-boundary.js';
import { calculatePrayerTimes, jafariMidnight, DEFAULT_PROFILE } from '../src/prayer-engine.js';
import { readText } from './helpers/read-text.js';

const KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const day = (y, m, d) => new Date(y, m, d);
/* Location whose solar time matches the machine's zone, so the test is the same in every TZ. */
function timesFor(date, profile = DEFAULT_PROFILE) {
  const offset = -date.getTimezoneOffset();
  return calculatePrayerTimes(date, 23.8, Math.max(-179, Math.min(179, offset / 4)), offset, profile);
}
function fardEvents(date, jafari = false) {
  const t = timesFor(date, jafari ? { method: 'jafari', school: 'jafari', highLatitude: 'none' } : DEFAULT_PROFILE);
  const next = timesFor(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1), jafari ? { method: 'jafari', school: 'jafari', highLatitude: 'none' } : DEFAULT_PROFILE);
  const midnight = jafari ? jafariMidnight(t.sunset, next.fajr) : null;
  return [
    { key: 'fajr', start: t.fajr, end: t.sunrise }, { key: 'dhuhr', start: t.dhuhr, end: t.asr },
    { key: 'asr', start: t.asr, end: t.maghrib }, { key: 'maghrib', start: t.maghrib, end: t.isha },
    { key: 'isha', start: t.isha, end: midnight && midnight > t.isha ? midnight : next.fajr }
  ];
}
function around(date, jafari) {
  const out = [];
  for (const offset of [-1, 0, 1]) out.push(...fardEvents(new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset), jafari));
  return out;
}
/* The hero's rule: the next prayer is the first start strictly after now. */
const heroNext = (events, now) => events.filter(e => e.start.getTime() > now).sort((a, b) => a.start - b.start)[0];

test('every prayer: the boundary is the start, and the hero rolls over on that exact millisecond', () => {
  for (const jafari of [false, true]) for (const date of [day(2026, 10, 10), day(2026, 11, 21), day(2027, 5, 21)]) {
    const events = around(date, jafari);
    const todays = fardEvents(date, jafari);
    for (const prayer of todays) {
      const start = prayer.start.getTime();
      assert.equal(heroNext(events, start - 1).key === prayer.key, true, `${prayer.key} is next just before its start`);
      assert.notEqual(heroNext(events, start).start.getTime(), start, `${prayer.key} is never "next" at its start`);
      assert.equal(heroNext(events, start).start.getTime() > start, true);
      const before = nextBoundary(events, start - 1);
      assert.ok(before <= start, `boundary at or before ${prayer.key} start`);
      assert.equal(needsRefresh({ now: start - 1, boundaryAt: start, lastTickAt: start - 1000, todayKey: 'a', lastDateKey: 'a' }), false);
      assert.equal(needsRefresh({ now: start, boundaryAt: start, lastTickAt: start - 1000, todayKey: 'a', lastDateKey: 'a' }), true);
      assert.ok(nextBoundary(events, start) > start, 'after the refresh the next boundary is later');
    }
  }
});

test('Fajr start rolls the hero to Dhuhr and the current prayer to Fajr (the reported screenshot case)', () => {
  const date = day(2026, 11, 10);
  const events = around(date, false);
  const fajr = fardEvents(date)[0].start.getTime();
  assert.equal(heroNext(events, fajr - 1000).key, 'fajr');
  assert.equal(heroNext(events, fajr).key, 'dhuhr');
  assert.equal(heroNext(events, fajr + 60000).key, 'dhuhr');
  const active = events.filter(e => fajr + 1000 >= e.start && fajr + 1000 < e.end);
  assert.deepEqual(active.map(e => e.key), ['fajr']);
  assert.equal(nextBoundary(events, fajr - 1), fajr);
});

test('Isha to Fajr: after Isha the next prayer is tomorrow’s Fajr, through midnight until it starts', () => {
  const date = day(2026, 10, 10);
  const events = around(date, false);
  const isha = fardEvents(date)[4].start.getTime();
  const fajrTomorrow = fardEvents(day(2026, 10, 11))[0].start.getTime();
  for (const now of [isha, isha + 1, new Date(2026, 10, 11, 0, 0, 0).getTime(), fajrTomorrow - 1]) assert.equal(heroNext(events, now).start.getTime(), fajrTomorrow);
  assert.equal(heroNext(events, fajrTomorrow).key, 'dhuhr');
  assert.equal(nextBoundary(events, fajrTomorrow - 1), fajrTomorrow);
});

test('Ja‘fari: midnight closes Isha and is a boundary; Fajr still rolls over', () => {
  const date = day(2026, 10, 10);
  const events = around(date, true);
  const isha = fardEvents(date, true)[4];
  assert.ok(isha.end.getTime() > isha.start.getTime() && isha.end.getTime() < fardEvents(day(2026, 10, 11), true)[0].start.getTime());
  assert.equal(nextBoundary(events, isha.end.getTime() - 1), isha.end.getTime());
  assert.equal(heroNext(events, fardEvents(day(2026, 10, 11), true)[0].start.getTime()).key, 'dhuhr');
});

test('a window end is a boundary too, so “available right now” closes on time', () => {
  const events = around(day(2026, 10, 10), false);
  const asr = fardEvents(day(2026, 10, 10))[2];
  assert.equal(nextBoundary(events, asr.start.getTime() + 1000), asr.end.getTime());
});

test('day change, backwards clock, sleep/wake and hidden-window gaps all force a refresh', () => {
  const base = { boundaryAt: 1e12, lastTickAt: 1e12 - 100000, todayKey: '2026-11-10', lastDateKey: '2026-11-10' };
  const now = 1e12 - 99000;
  assert.equal(needsRefresh({ ...base, now }), false);
  assert.equal(needsRefresh({ ...base, now, todayKey: '2026-11-11' }), true, 'civil day changed');
  assert.equal(needsRefresh({ ...base, now: base.lastTickAt - 1 }), true, 'clock went backwards');
  assert.equal(needsRefresh({ ...base, now: base.lastTickAt + TICK_GAP_MS + 1 }), true, 'slept or throttled');
  assert.equal(needsRefresh({ ...base, now: base.lastTickAt + TICK_GAP_MS }), false);
  assert.equal(needsRefresh({ ...base, now, lastTickAt: null }), false, 'no tick yet (hidden window): only boundary or day');
  assert.equal(needsRefresh({ ...base, now: 1e12, lastTickAt: null }), true);
  assert.equal(needsRefresh({ now, boundaryAt: null, lastTickAt: null, todayKey: 'a', lastDateKey: 'a' }), false);
});

test('timer delay fires just after the boundary and is re-checked at least once a minute', () => {
  assert.equal(boundaryDelay(1000, 900), 125);
  assert.equal(boundaryDelay(900, 1000), 25);
  assert.equal(boundaryDelay(null, 0), 60000);
  assert.equal(boundaryDelay(1e12, 0), 60000);
  assert.equal(nextBoundary([], 5), null);
});

test('the app re-arms the boundary on every render and checks it on every tick', () => {
  const app = readText('../src/app.js', import.meta.url);
  assert.match(app, /updateTrayTooltip\(\);\n  armBoundary\(\);\n\}/);
  assert.match(app, /tickHandle = setInterval\(\(\) => \{\n    refreshIfStale\(\);/);
  assert.match(app, /function refreshIfStale\(\)/);
  assert.match(app, /setTimeout\(refreshIfStale, boundaryDelay/);
  assert.match(app, /function renderLiveEvents\(\) \{[\s\S]*getActiveEvents\(new Date\(\)\)/);
  assert.match(app, /document\.addEventListener\('visibilitychange'[\s\S]*render\(\);/);
});

test('"Available right now" is ALWAYS the first block of the home page, with its calm empty state, directly above the next-event hero; nothing reorders on a tick', () => {
  const app = readText('../src/app.js', import.meta.url);
  const css = readText('../src/styles.css', import.meta.url);
  const html = readText('../index.html', import.meta.url);
  assert.doesNotMatch(app, /placeLiveSection|live-first|is-first/, 'no dynamic reordering any more');
  assert.doesNotMatch(css, /live-first|is-first/);
  const main = html.slice(html.indexOf('<main id="homeView">'));
  assert.ok(main.indexOf('live-events-section') < main.indexOf('class="hero-grid"'), 'live events come first, then the hero');
  assert.ok(main.indexOf('class="hero-grid"') < main.indexOf('id="occasionBanner"'));
  assert.match(main.slice(0, 200), /^<main id="homeView">\s*<section class="section-block live-events-section">/, 'nothing precedes it in the page');
  assert.match(app, /<div class="live-empty">/, 'calm empty state in the same place');
  assert.match(css, /\.live-events-section \+ \.hero-grid/);
  assert.match(css, /\.compact-mode \.live-events-section/);
});

test('v1.3.3: the home-page timetable is gone; its method, Asr method, time zone and prohibited intervals live in Settings', () => {
  const app = readText('../src/app.js', import.meta.url);
  const html = readText('../index.html', import.meta.url);
  assert.doesNotMatch(html, /id="timetable"|id="methodLabel"|timetable-section|LOCAL TIMETABLE/);
  assert.doesNotMatch(app, /function renderTimetable|\$\('timetable'\)|\$\('methodLabel'\)/);
  for (const id of ['methodSelect', 'schoolSelect', 'highLatSelect', 'timezoneLabel', 'profileSummary', 'settingsIntervals']) assert.match(html, new RegExp(`id="${id}"`), `${id} is in Settings`);
  assert.ok(html.indexOf('id="settingsIntervals"') > html.indexOf('<main id="settingsView"'));
  assert.match(app, /function renderSettingsIntervals\(\)/);
  assert.match(app, /prohibitedIntervals\(times\)\.map\(item => `\$\{names\[item\.key\]\}: \$\{fmt\(item\.start\)\} – \$\{fmt\(item\.end\)\}`\)/);
  assert.match(app, /renderSettingsIntervals\(\);/);
  assert.doesNotMatch(readText('../src/styles.css', import.meta.url), /\.time-row|\.timetable\b/, 'dead CSS removed');
});

test('regression: the hero is no longer a cached snapshot (it was only rebuilt by render(), so it stayed on the prayer that had just begun)', () => {
  const app = readText('../src/app.js', import.meta.url);
  const tick = /tickHandle = setInterval\(\(\) => \{\n    refreshIfStale\(\);\n    updateClock\(\);\n    updateCountdownWidgets\(\);/;
  assert.match(app, tick);
  assert.match(app, /lastTickAt = null;\n\}/, 'a stopped tick (hidden window) clears the tick clock');
  assert.match(app, /needsRefresh\(\{ now, boundaryAt, lastTickAt, todayKey/);
});
