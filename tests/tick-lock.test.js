import test from 'node:test';
import assert from 'node:assert/strict';
import { lockInstant, isLockedAt, dayIsLocked, nextWatermark, sealRecord, lockTip, lockKey } from '../src/tick-lock.js';
import { migrateHistory, migrateRecord } from '../src/history-migrate.js';
import { addDaysKey } from '../src/habits.js';
import { readText } from './helpers/read-text.js';

const H = 3600000;
const T0 = Date.UTC(2026, 10, 13, 0, 0, 0);
const at = h => T0 + h * H;
const ev = (kind, key, h) => ({ kind, key, start: new Date(at(h)) });
// A Sunni prayer day: Duha follows sunrise, Awwabin starts with Maghrib, night events start with Isha.
const DAY = [ev('fard', 'fajr', 4.87), ev('voluntary', 'duha', 6.5), ev('fard', 'dhuhr', 11.8), ev('fard', 'asr', 15.3), ev('fard', 'maghrib', 17.3), ev('voluntary', 'awwabin', 17.3), ev('fard', 'isha', 18.5), ev('voluntary', 'qiyam', 18.5), ev('voluntary', 'witr', 18.5), ev('voluntary', 'tarawih', 18.5), ev('voluntary', 'tahajjud', 27.0)];
const FAJR_NEXT = at(28.87);
const JAFARI = DAY.filter(e => !['duha', 'awwabin', 'tarawih'].includes(e.key));
const lock = (kind, key, events = DAY, prayer) => lockInstant({ kind, key, prayer }, events, FAJR_NEXT);

test('Fard and standalone events lock when the next prayer event starts', () => {
  assert.deepEqual(lock('fard', 'fajr'), { at: at(6.5), by: 'duha' });
  assert.deepEqual(lock('fard', 'dhuhr'), { at: at(15.3), by: 'asr' });
  assert.deepEqual(lock('fard', 'asr'), { at: at(17.3), by: 'maghrib' });
  assert.deepEqual(lock('fard', 'maghrib'), { at: at(18.5), by: 'isha' }, 'Awwabin starts with Maghrib, so it is not "next"');
  assert.deepEqual(lock('voluntary', 'awwabin'), { at: at(18.5), by: 'isha' });
  assert.deepEqual(lock('voluntary', 'duha'), { at: at(11.8), by: 'dhuhr' });
});

test('Isha, Witr, Qiyam and Tahajjud lock at the next Fajr (the prayer-day rollover)', () => {
  for (const [kind, key] of [['fard', 'isha'], ['voluntary', 'witr'], ['voluntary', 'tahajjud'], ['voluntary', 'qiyam']]) assert.deepEqual(lock(kind, key), { at: FAJR_NEXT, by: 'fajr' }, key);
});

test('date-specific events lock when the next event starts (Tarawih: the Tahajjud window; Eid: Dhuhr)', () => {
  assert.deepEqual(lock('voluntary', 'tarawih'), { at: at(27.0), by: 'tahajjud' });
  const eid = [...DAY, ev('voluntary', 'eid_prayer', 6.5)];
  assert.deepEqual(lock('voluntary', 'eid_prayer', eid), { at: at(11.8), by: 'dhuhr' });
});

test('Sunnah and Nafl parts lock together with their Fard', () => {
  assert.deepEqual(lock('sunnah', 'dhuhr_before', DAY, 'dhuhr'), lock('fard', 'dhuhr'));
  assert.deepEqual(lock('nafl', 'isha_nafl', DAY, 'isha'), lock('fard', 'isha'));
  assert.deepEqual(lock('sunnah', 'fajr_before', DAY, 'fajr'), lock('fard', 'fajr'));
});

test('Ja‘fari: there is no Duha/Awwabin/Tarawih, so Fajr locks at Dhuhr and Maghrib at Isha', () => {
  assert.deepEqual(lock('fard', 'fajr', JAFARI), { at: at(11.8), by: 'dhuhr' });
  assert.deepEqual(lock('fard', 'maghrib', JAFARI), { at: at(18.5), by: 'isha' });
  assert.equal(lock('voluntary', 'duha', JAFARI), null, 'an event that does not exist has no lock instant');
});

test('the lock bites exactly at the next event: one millisecond before it is open, at it it is locked', () => {
  const l = lock('fard', 'dhuhr');
  assert.equal(isLockedAt({ kind: 'fard', key: 'dhuhr' }, DAY, FAJR_NEXT, l.at - 1), false);
  assert.equal(isLockedAt({ kind: 'fard', key: 'dhuhr' }, DAY, FAJR_NEXT, l.at), true);
  assert.equal(isLockedAt({ kind: 'fard', key: 'isha' }, DAY, FAJR_NEXT, FAJR_NEXT - 1), false);
  assert.equal(isLockedAt({ kind: 'fard', key: 'isha' }, DAY, FAJR_NEXT, FAJR_NEXT), true);
  assert.equal(isLockedAt({ kind: 'fard', key: 'dhuhr' }, DAY, FAJR_NEXT, 0, true), true, 'a remembered lock stays, even if the clock was set back');
  assert.equal(isLockedAt({ kind: 'fard', key: 'isha' }, DAY, null, at(40)), false, 'no times known: nothing is guessed');
});

test('past prayer days are locked; the date watermark keeps them locked after a clock change and moves at most a day at a time', () => {
  assert.equal(dayIsLocked('2026-11-12', '2026-11-13'), true);
  assert.equal(dayIsLocked('2026-11-13', '2026-11-13'), false);
  assert.equal(dayIsLocked('2026-11-13', '2026-11-12', '2026-11-13'), true, 'clock set back one day: still locked');
  assert.equal(nextWatermark(null, '2026-11-13', addDaysKey), '2026-11-12');
  assert.equal(nextWatermark('2026-11-12', '2026-11-13', addDaysKey), '2026-11-12');
  assert.equal(nextWatermark('2026-11-12', '2026-11-14', addDaysKey), '2026-11-13');
  assert.equal(nextWatermark('2026-11-12', '2026-12-30', addDaysKey), '2026-11-13', 'a clock set far ahead cannot lock future days');
  assert.equal(nextWatermark('2026-11-12', '2026-11-05', addDaysKey), '2026-11-12', 'never moves backwards');
});

test('sealRecord remembers a lock once its instant has passed; unmarked items are left alone', () => {
  const record = { fard: { fajr: true, dhuhr: true, asr: false }, voluntary: { duha: true }, sunnah: { dhuhr_before: true } };
  const itemsFor = (layer, key) => ({ item: { kind: layer, key, prayer: key.split('_')[0] }, events: DAY, nextFajr: FAJR_NEXT });
  assert.equal(sealRecord(record, itemsFor, at(12)), true);
  assert.deepEqual(Object.keys(record.locked).sort(), [lockKey('fard', 'fajr'), lockKey('voluntary', 'duha')].sort());
  assert.equal(sealRecord(record, itemsFor, at(12)), false, 'nothing new');
  sealRecord(record, itemsFor, at(16));
  assert.ok(record.locked['fard:dhuhr'] && record.locked['sunnah:dhuhr_before']);
  assert.ok(!record.locked['fard:asr']);
  assert.equal(sealRecord(null, itemsFor, 0), false);
});

test('tooltips are bilingual, calm, and name the prayer that began', () => {
  assert.equal(lockTip('Dhuhr', 'en'), 'Locked after Dhuhr began');
  assert.equal(lockTip('যোহর', 'bn'), 'যোহর শুরু হওয়ার পর লক হয়েছে');
  assert.doesNotMatch(lockTip(null, 'en') + lockTip(null, 'bn'), /[0-9]|miss|fail|\blate\b|\btoo\b/i);
  assert.match(lockTip(null, 'bn'), /[\u0980-\u09FF]/);
});

test('history from older versions loads: missing locked/at fields, voluntary sub-part objects, junk records', () => {
  const old = { '2026-01-01': { fard: { fajr: true }, voluntary: {} }, '2026-01-02': { fard: { dhuhr: true, jumuah: true }, voluntary: { duha: { before: true, after: false }, witr: true, awwabin: { a: false } }, sunnah: { dhuhr_before: true } }, '2026-01-03': 'broken', '2026-01-04': null, 'not-a-date': { fard: { fajr: true } } };
  const out = migrateHistory(old);
  assert.deepEqual(Object.keys(out), ['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04']);
  assert.deepEqual(out['2026-01-02'].voluntary, { duha: true, witr: true }, 'sub-part objects fold into one tick; empty ones vanish');
  assert.deepEqual(out['2026-01-02'].fard, { dhuhr: true, jumuah: true });
  assert.deepEqual(out['2026-01-02'].sunnah, { dhuhr_before: true });
  assert.deepEqual(out['2026-01-03'], { fard: {}, voluntary: {} });
  assert.deepEqual(migrateRecord({ fard: 'x', voluntary: [] }), { fard: {}, voluntary: {} });
  assert.deepEqual(migrateHistory(undefined), {});
  assert.deepEqual(migrateHistory(migrateHistory(old)), out, 'idempotent');
  const kept = migrateRecord({ fard: { fajr: true }, voluntary: {}, at: { 'fard:fajr': [3, 300] }, locked: { 'fard:fajr': 1 } });
  assert.deepEqual([kept.at, kept.locked], [{ 'fard:fajr': [3, 300] }, { 'fard:fajr': 1 }]);
});

test('standalone voluntary prayers have a single tick; sub-ticks exist only for the five Fard prayers', async () => {
  const layers = await import('../src/prayer-layers.js');
  const fard = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  for (const slot of [...layers.SUNNAH_SLOTS, ...layers.NAFL_SLOTS]) assert.ok(fard.includes(slot.prayer), slot.key);
  for (const key of ['duha', 'awwabin', 'qiyam', 'tahajjud', 'witr', 'tarawih', 'eid_prayer']) {
    assert.deepEqual(layers.prayerParts(key).map(p => p.layer), ['fard'], `${key} has no linked parts`);
  }
  const app = readText('../src/app.js', import.meta.url);
  assert.match(app, /\$\{event\.kind === 'fard' \? partsHtml\(event\.key, event\.date, true, \{ includeFard: false \}\) : ''\}/, 'live card: parts only for Fard');
  assert.match(app, /layer-\$\{layerOf\(event\.kind, event\.key\)\}/, 'voluntary uses the striped or saffron single tick');
});

test('wiring: locked ticks are blocked silently (no toast, no sound), shown with a padlock and tooltip, in the live card, daily cards, voluntary rows and weekly view', () => {
  const app = readText('../src/app.js', import.meta.url);
  const css = readText('../src/styles.css', import.meta.url);
  assert.match(app, /if \(dayRecord\(eventDate, false\)\[kind\]\?\.\[key\] && lockState\(kind, key, eventDate\)\.locked\) return;/);
  assert.match(app, /if \(dayRecord\(eventDate, false\)\[layer\]\?\.\[key\] && lockState\(layer, key, eventDate\)\.locked\) return;/);
  for (const [fn, probe] of [['function togglePrayer', 'lockState(kind, key, eventDate).locked) return;'], ['function toggleSubPrayer', 'lockState(layer, key, eventDate).locked) return;']]) {
    const body = app.slice(app.indexOf(fn));
    assert.ok(body.indexOf(probe) > 0 && body.indexOf(probe) < body.indexOf("showToast('This prayer event is not currently available.')"), `${fn}: the lock check comes before any message`);
  }
  assert.match(app, /sealLocks\(\);/);
  assert.match(app, /aria-disabled="true"/);
  assert.doesNotMatch(app.slice(app.indexOf('function lockState'), app.indexOf('function togglePrayer')), /showToast|playCues|playLayerSound/);
  assert.match(app, /lockTipFor\('fard', prayer\.key, selectedDate\)/);
  assert.match(app, /lockTipFor\('voluntary', event\.key, date\)/);
  assert.match(app, /const dayLocked = dayIsLocked\(dateKey\(date\), dateKey\(progressDate\(now\)\), state\.lockWatermark\)/);
  assert.match(app, /migrateHistory\(saved\.history\)/);
  assert.match(css, /\.lock-mark::after \{ content:attr\(data-lock-tip\)/);
  assert.match(css, /\.is-locked:focus-visible > \.lock-mark::after/, 'keyboard focus shows the tooltip too');
  assert.match(css, /\.round-check\.is-locked:hover \{ transform:none; \}/);
  assert.doesNotMatch(app.slice(app.indexOf('function lockTipFor'), app.indexOf('function togglePrayer')), /late|miss|fail/i);
  const liveFn = app.slice(app.indexOf('function renderLiveEvents'), app.indexOf('function renderFard'));
  assert.doesNotMatch(liveFn, /\$\{lockTip[ )]/, 'regression: the imported lockTip() function (always truthy) was used instead of the per-item text, locking every button');
  assert.match(liveFn, /\$\{lockText \? ' is-locked' : ''\}/);
  assert.match(app, /if \(record\.at\) delete record\.at\[`\$\{layer\}:\$\{key\}`\];/, 'regression: the sub-part untick used an undefined variable');
});
