import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTimeline, nextEventAfter, eventLabel } from '../src/day-timeline.js';
import { prohibitedIntervals } from '../src/forbidden-times.js';
import { calculatePrayerTimes, jafariMidnight } from '../src/prayer-engine.js';
import { readText } from './helpers/read-text.js';

const MIN = 60000;
const PROFILES = {
  hanafi: { method: 'karachi', school: 'hanafi', highLatitude: 'none' },
  shafii: { method: 'mwl', school: 'shafii', highLatitude: 'none' },
  jafari: { method: 'jafari', school: 'jafari', highLatitude: 'none' }
};
const dayAdd = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/* Same construction as the app (getTimes, getFardEvents, getVoluntaryEvents, forbidden intervals),
   at a location whose solar time matches the machine's zone so the test is TZ independent. */
function day(date, school) {
  const profile = PROFILES[school]; const shia = school === 'jafari';
  const times = d => {
    const off = -d.getTimezoneOffset();
    const t = calculatePrayerTimes(d, 23.8, Math.max(-179, Math.min(179, off / 4)), off, profile);
    t.zawalStart = new Date(t.solarNoon.getTime() - 6 * MIN); t.zawalEnd = new Date(t.solarNoon.getTime() + 6 * MIN); t.dhuhr = new Date(t.zawalEnd.getTime());
    return t;
  };
  const t = times(date), n = times(dayAdd(date, 1));
  if (shia) t.midnight = jafariMidnight(t.sunset, n.fajr);
  const fard = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(key => ({ key, start: t[key], date }));
  const dur = n.fajr - t.maghrib;
  const voluntary = [{ key: 'qiyam', start: t.isha }, { key: 'witr', start: t.isha }, { key: 'tahajjud', start: new Date(n.fajr - dur / 3) }];
  if (!shia) voluntary.push({ key: 'duha', start: new Date(t.sunrise.getTime() + 20 * MIN) }, { key: 'awwabin', start: t.maghrib });
  return { fard, voluntary, prohibited: prohibitedIntervals(t), midnight: shia ? t.midnight : null, t };
}
const timelineFor = (date, school) => buildTimeline([-1, 0, 1].map(o => day(dayAdd(date, o), school)));
const todays = (timeline, date) => timeline.filter(e => e.at >= date.getTime() && e.at < dayAdd(date, 1).getTime());
const seq = events => events.map(e => e.kind === 'prohibited-start' ? 'prohibited' : e.kind === 'prohibited-end' ? 'prohibited-end' : e.kind === 'midnight' ? 'midnight' : e.key);

test('Hanafi full day: Fajr, sunrise interval, Duha, Zawal, Dhuhr, Asr, pre-sunset interval, Maghrib, Isha, last third', () => {
  const date = new Date(2026, 10, 10);
  const s = seq(todays(timelineFor(date, 'hanafi'), date));
  const order = s.filter(x => x !== 'prohibited-end' && x !== 'tahajjud');
  assert.deepEqual(order, ['fajr', 'prohibited', 'duha', 'prohibited', 'dhuhr', 'asr', 'prohibited', 'maghrib', 'isha']);
});

test('Shafi‘i full day: same event order as Hanafi (only the Asr time differs)', () => {
  const date = new Date(2026, 10, 10);
  const order = seq(todays(timelineFor(date, 'shafii'), date)).filter(x => x !== 'prohibited-end' && x !== 'tahajjud');
  assert.deepEqual(order, ['fajr', 'prohibited', 'duha', 'prohibited', 'dhuhr', 'asr', 'prohibited', 'maghrib', 'isha']);
});

test('Ja‘fari full day: no Duha or Awwabin; the sunrise and pre-sunset intervals end on their own; midnight closes Isha before the last third', () => {
  const date = new Date(2026, 10, 10);
  const s = seq(todays(timelineFor(date, 'jafari'), date));
  assert.ok(!s.includes('duha') && !s.includes('awwabin'));
  const core = s.filter(x => x !== 'tahajjud');
  // The synthetic location cannot reach solar time beyond UTC±12 (longitude is capped at 180°), so the calendar-day split is only asserted inside that range.
  if (Math.abs(date.getTimezoneOffset()) <= 720) assert.deepEqual(core, ['fajr', 'prohibited', 'prohibited-end', 'prohibited', 'dhuhr', 'asr', 'prohibited', 'prohibited-end', 'maghrib', 'isha', 'midnight']);
  const full = timelineFor(date, 'jafari');
  const idx = seq(full);
  const isha = idx.lastIndexOf('isha', idx.indexOf('midnight', idx.indexOf('isha')));
  assert.ok(isha >= 0 && idx.indexOf('midnight', isha) > isha, 'midnight follows Isha');
  const after = idx.slice(idx.indexOf('midnight', isha) + 1);
  assert.equal(after[0], 'tahajjud', 'the last third of the night follows midnight');
  assert.equal(after[1], 'fajr', 'then tomorrow’s Fajr');
});

test('every event is strictly ordered, unique per instant, and each school’s day has the five prayers once', () => {
  for (const school of Object.keys(PROFILES)) for (const date of [new Date(2026, 10, 10), new Date(2026, 11, 21), new Date(2027, 5, 21)]) {
    const timeline = timelineFor(date, school);
    for (let i = 1; i < timeline.length; i++) assert.ok(timeline[i].at > timeline[i - 1].at, `${school} ${i}`);
    const mine = todays(timeline, date);
    for (const key of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']) assert.equal(mine.filter(e => e.kind === 'fard' && e.key === key).length, 1, `${school} ${key}`);
  }
});

test('a prayer wins when an interval ends at the same instant (Zawal→Dhuhr, sunrise→Duha, sunset→Maghrib)', () => {
  const date = new Date(2026, 10, 10);
  const d = day(date, 'hanafi');
  const timeline = buildTimeline([d]);
  const at = ms => timeline.find(e => e.at === ms);
  assert.equal(at(d.t.dhuhr.getTime()).key, 'dhuhr');
  assert.equal(at(d.t.sunrise.getTime() + 20 * MIN).key, 'duha');
  assert.equal(at(d.t.maghrib.getTime()).key, 'maghrib');
});

test('Eid prayer outranks Duha and the interval end at the same instant', () => {
  const at = new Date(2027, 2, 9, 6, 30).getTime();
  const t = buildTimeline([{ voluntary: [{ key: 'duha', start: at }, { key: 'eid_prayer', start: at }], prohibited: [{ key: 'sunrise', start: at - 20 * MIN, end: at }] }]);
  assert.deepEqual(t.map(e => `${e.kind}:${e.key}`), ['prohibited-start:sunrise', 'voluntary:eid_prayer']);
});

test('exact boundary: the instant an event starts, the next event is the one after it; never "00:00:00"', () => {
  const date = new Date(2026, 10, 10);
  for (const school of Object.keys(PROFILES)) {
    const timeline = timelineFor(date, school);
    for (let i = 0; i < timeline.length - 1; i++) {
      const e = timeline[i];
      assert.equal(nextEventAfter(timeline, e.at - 1).at, e.at);
      assert.equal(nextEventAfter(timeline, e.at).at, timeline[i + 1].at);
      assert.ok(nextEventAfter(timeline, e.at).at - e.at > 0);
    }
  }
  assert.equal(nextEventAfter([], 1), null);
});

test('hero wording: calm "Prohibited time" in Sunni modes, "Disliked time" in Ja‘fari, both languages', () => {
  const start = { kind: 'prohibited-start', key: 'sunrise' }, end = { kind: 'prohibited-end', key: 'sunrise' };
  assert.deepEqual(eventLabel(start), { name: 'Prohibited time', verb: 'Begins at' });
  assert.deepEqual(eventLabel(end), { name: 'Prohibited time ends', verb: 'Ends at' });
  assert.equal(eventLabel(start, { lang: 'bn' }).name, 'নিষিদ্ধ সময়');
  assert.equal(eventLabel(end, { lang: 'bn' }).name, 'নিষিদ্ধ সময় শেষ');
  assert.equal(eventLabel(start, { shia: true }).name, 'Disliked time');
  assert.equal(eventLabel(start, { lang: 'bn', shia: true }).name, 'মাকরুহ সময়');
  assert.equal(eventLabel({ kind: 'midnight', key: 'midnight' }, { shia: true }).name, 'Midnight (end of Isha)');
  assert.equal(eventLabel({ kind: 'fard', key: 'asr' }, { prayerName: k => k.toUpperCase() }).name, 'ASR');
});

test('the hero is built from the timeline and labelled "Next event" in both languages', () => {
  const app = readText('../src/app.js', import.meta.url);
  const html = readText('../index.html', import.meta.url);
  assert.match(app, /function getNextEvent\(now = new Date\(\)\)/);
  assert.match(app, /const next = getNextEvent\(new Date\(\)\);\n  nextPrayer = next;/);
  assert.match(app, /\$\('nextEyebrow'\)\.textContent = 'NEXT EVENT'/);
  assert.match(app, /'NEXT EVENT':'এরপর যা আসছে'/);
  assert.match(html, /id="nextEyebrow">NEXT EVENT</);
  assert.match(app, /prohibitedIntervals\(times\)/);
  assert.match(app, /is-interval/);
});
