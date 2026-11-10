import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePrayerTimes, jafariMidnight, CALCULATION_METHODS, SCHOOLS, HIGH_LATITUDE_RULES, DEFAULT_PROFILE, sanitizeProfile, presetForSchool, isShiaProfile } from '../src/prayer-engine.js';
import { readText } from './helpers/read-text.js';

/* Reference values (minutes after local midnight in the city's own UTC
   offset, unrounded). Fajr, sunrise, Maghrib and Isha: adhan-js 4.4
   (Rounding.None). Asr and Ja'fari midnight: the praytimes.org v2 algorithm
   (npm "praytimes" 0.0.5). Generated once offline and stored here, so the
   tests never need the network or those libraries. */
const REFERENCE = JSON.parse(readText('./fixtures/reference-times.json', import.meta.url));

// Minutes after midnight in the city's offset, independent of the machine's time zone.
const minutesOf = (value, date) => (value.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) / 60000;
const parse = text => { const [y, m, d] = text.split('-').map(Number); return new Date(y, m - 1, d); };

test('methods, schools and high-latitude rules are the documented ones', () => {
  const angles = Object.fromEntries(Object.entries(CALCULATION_METHODS).map(([k, m]) => [k, [m.fajr, m.isha ?? `${m.ishaInterval} min`, m.maghribAngle ?? 0]]));
  assert.deepEqual(angles, {
    karachi: [18, 18, 0], mwl: [18, 17, 0], isna: [15, 15, 0], egypt: [19.5, 17.5, 0], ummalqura: [18.5, '90 min', 0],
    gulf: [19.5, '90 min', 0], kuwait: [18, 17.5, 0], qatar: [18, '90 min', 0], singapore: [20, 18, 0], turkey: [18, 17, 0],
    tehran: [17.7, 14, 4.5], jafari: [16, 14, 4]
  });
  assert.equal(CALCULATION_METHODS.ummalqura.ramadanIshaInterval, 120);
  assert.deepEqual(CALCULATION_METHODS.turkey.adjustments, { sunrise: -7, dhuhr: 5, asr: 4, maghrib: 7 });
  assert.deepEqual(Object.fromEntries(Object.entries(SCHOOLS).map(([k, s]) => [k, s.asrFactor])), { hanafi: 2, shafii: 1, maliki: 1, hanbali: 1, jafari: 1 });
  assert.deepEqual(Object.keys(HIGH_LATITUDE_RULES), ['none', 'middle', 'seventh', 'angle']);
  for (const table of [CALCULATION_METHODS, SCHOOLS, HIGH_LATITUDE_RULES]) for (const item of Object.values(table)) assert.ok(item.en && item.bn, 'bilingual label');
  assert.deepEqual(DEFAULT_PROFILE, { method: 'karachi', school: 'hanafi', highLatitude: 'none' });
});

test('computed times match adhan-js / praytimes.org within one minute (12 cities, 3 dates)', () => {
  assert.ok(REFERENCE.length >= 30);
  for (const ref of REFERENCE) {
    const date = parse(ref.date);
    const t = calculatePrayerTimes(date, ref.lat, ref.lon, ref.offset, { method: ref.method, school: ref.school });
    for (const key of ['fajr', 'sunrise', 'asr', 'maghrib', 'isha']) {
      const diff = Math.abs(minutesOf(t[key], date) - ref[key]);
      assert.ok(diff < 1, `${ref.city} ${ref.date} ${ref.method}/${ref.school} ${key}: off by ${diff.toFixed(2)} min`);
    }
    if (ref.midnight) {
      const next = calculatePrayerTimes(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1), ref.lat, ref.lon, ref.offset, { method: ref.method, school: ref.school });
      const midnight = minutesOf(jafariMidnight(t.sunset, next.fajr), date);
      assert.ok(Math.abs(midnight - ref.midnight) < 1, `${ref.city} midnight ${midnight} vs ${ref.midnight}`);
    }
  }
  const cities = new Set(REFERENCE.map(ref => ref.city));
  for (const city of ['Dhaka', 'Makkah', 'London', 'Tehran']) assert.ok(cities.has(city), city);
});

test('default profile is unchanged from v1.3.0 (Karachi 18/18, Hanafi, Zawal margin)', () => {
  const date = new Date(2026, 10, 10);
  const t = calculatePrayerTimes(date, 23.8103, 90.4125, 360);
  const same = calculatePrayerTimes(date, 23.8103, 90.4125, 360, { ...DEFAULT_PROFILE });
  for (const key of Object.keys(t)) assert.equal(t[key].getTime(), same[key].getTime(), key);
  const expected = { fajr: 292.024, sunrise: 369.691, solarNoon: 702.232, dhuhr: 708.232, asr: 938.84, maghrib: 1034.773, isha: 1112.439 };
  for (const [key, minutes] of Object.entries(expected)) assert.ok(Math.abs(minutesOf(t[key], date) - minutes) < 0.01, key);
  assert.equal(t.dhuhr - t.solarNoon, 6 * 60000);
});

test('Umm al-Qura Isha is 90 minutes after Maghrib, 120 in Ramadan', () => {
  const date = new Date(2026, 1, 25);
  const normal = calculatePrayerTimes(date, 21.4225, 39.8262, 180, { method: 'ummalqura', school: 'shafii' });
  const ramadan = calculatePrayerTimes(date, 21.4225, 39.8262, 180, { method: 'ummalqura', school: 'shafii', ramadan: true });
  assert.equal(normal.isha - normal.sunset, 90 * 60000);
  assert.equal(ramadan.isha - ramadan.sunset, 120 * 60000);
});

test('Ja‘fari: Maghrib after the eastern redness, Asr factor 1, Dhuhr after the Zawal margin', () => {
  const date = new Date(2026, 10, 10);
  const shia = calculatePrayerTimes(date, 34.64, 50.88, 210, { method: 'jafari', school: 'jafari' });
  const sunni = calculatePrayerTimes(date, 34.64, 50.88, 210, { method: 'mwl', school: 'hanafi' });
  assert.ok(shia.maghrib - shia.sunset > 10 * 60000 && shia.maghrib - shia.sunset < 25 * 60000, 'Maghrib ~15 min after sunset');
  assert.ok(shia.asr < sunni.asr, 'factor-1 Asr is earlier than Hanafi');
  assert.equal(shia.dhuhr - shia.solarNoon, 6 * 60000);
  assert.equal(isShiaProfile({ school: 'jafari' }), true);
  assert.equal(isShiaProfile({ school: 'hanafi' }), false);
});

test('school presets switch to a fitting method; invalid profiles fall back to the default', () => {
  assert.equal(presetForSchool('jafari', 'karachi'), 'jafari');
  assert.equal(presetForSchool('jafari', 'tehran'), 'tehran');
  assert.equal(presetForSchool('hanafi', 'jafari'), 'karachi');
  assert.equal(presetForSchool('shafii', 'tehran'), 'mwl');
  assert.equal(presetForSchool('maliki', 'egypt'), 'egypt');
  assert.deepEqual(sanitizeProfile({ method: 'x', school: 'y', highLatitude: 'z' }), DEFAULT_PROFILE);
  assert.deepEqual(sanitizeProfile(null), DEFAULT_PROFILE);
  assert.deepEqual(sanitizeProfile({ method: 'isna', school: 'maliki', highLatitude: 'seventh' }), { method: 'isna', school: 'maliki', highLatitude: 'seventh' });
});

test('every method × school produces valid, ordered times (all dates of the year, 5 latitudes)', () => {
  const places = [[23.81, 90.41, 360], [21.42, 39.83, 180], [51.51, -0.13, 0], [35.69, 51.39, 210], [-33.87, 151.21, 600]];
  for (const method of Object.keys(CALCULATION_METHODS)) for (const school of Object.keys(SCHOOLS)) for (const [lat, lon, offset] of places) {
    for (let day = 0; day < 366; day += 7) {
      const date = new Date(2026, 0, 1 + day);
      // London cannot reach 18–20° twilight in midsummer; there the safeguard rule applies.
      const highLatitude = Math.abs(lat) > 48 ? 'angle' : 'none';
      const t = calculatePrayerTimes(date, lat, lon, offset, { method, school, highLatitude });
      for (const [key, value] of Object.entries(t)) assert.ok(value instanceof Date && Number.isFinite(value.getTime()), `${method}/${school} ${key}`);
      const order = ['fajr', 'sunrise', 'zawalStart', 'dhuhr', 'asr', 'maghrib', 'isha'];
      for (let i = 1; i < order.length; i++) assert.ok(t[order[i - 1]] < t[order[i]], `${method}/${school} ${lat} day ${day}: ${order[i - 1]} < ${order[i]}`);
      assert.ok(t.sunset <= t.maghrib);
    }
  }
});

test('high-latitude rules keep Fajr before sunrise and Isha after Maghrib at 60°N in June', () => {
  const date = new Date(2026, 5, 21);
  for (const rule of ['middle', 'seventh', 'angle']) for (const method of ['mwl', 'karachi', 'isna', 'jafari']) {
    const t = calculatePrayerTimes(date, 60.17, 24.94, 180, { method, school: 'shafii', highLatitude: rule });
    assert.ok(t.fajr < t.sunrise && t.isha > t.maghrib, `${rule}/${method}`);
    const night = 24 * 60 - (t.sunset - t.sunrise) / 60000;
    if (rule === 'seventh') assert.ok(Math.abs((t.sunrise - t.fajr) / 60000 - night / 7) < 3);
  }
});
