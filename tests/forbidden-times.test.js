import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { prohibitedIntervals, activeProhibition, SUNRISE_PROHIBITED_MINUTES, SUNSET_PROHIBITED_MINUTES } from '../src/forbidden-times.js';
import { calculatePrayerTimes } from '../src/prayer-engine.js';
import { readText } from './helpers/read-text.js';

const app = readText('../src/app.js', import.meta.url);
const css = readText('../src/styles.css', import.meta.url);
const at = (h, m) => new Date(2026, 10, 10, h, m);
const times = {
  sunrise: at(6, 10), zawalStart: at(11, 40), zawalEnd: at(11, 52),
  sunset: at(17, 15), maghrib: at(17, 15)
};

test('three Hanafi intervals: sunrise +20 min, Zawal, last 15 min before sunset', () => {
  assert.equal(SUNRISE_PROHIBITED_MINUTES, 20);
  assert.equal(SUNSET_PROHIBITED_MINUTES, 15);
  const list = prohibitedIntervals(times);
  assert.deepEqual(list.map(item => item.key), ['sunrise', 'zawal', 'sunset']);
  assert.deepEqual(list.map(item => [item.start.getHours() * 60 + item.start.getMinutes(), item.end.getHours() * 60 + item.end.getMinutes()]),
    [[370, 390], [700, 712], [1020, 1035]]);
});

test('active interval: start inclusive, end exclusive, none in between', () => {
  assert.equal(activeProhibition(times, at(6, 10))?.key, 'sunrise');
  assert.equal(activeProhibition(times, at(6, 29))?.key, 'sunrise');
  assert.equal(activeProhibition(times, at(6, 30)), null);
  assert.equal(activeProhibition(times, at(11, 45))?.key, 'zawal');
  assert.equal(activeProhibition(times, at(11, 52)), null);
  assert.equal(activeProhibition(times, at(17, 0))?.key, 'sunset');
  assert.equal(activeProhibition(times, at(17, 15)), null);
  assert.equal(activeProhibition(times, at(14, 0)), null);
  assert.equal(activeProhibition(null, at(6, 15)), null);
});

test('works with the real calculation (sunset key) for Dhaka', () => {
  const real = calculatePrayerTimes(new Date(2026, 10, 10), 23.8103, 90.4125);
  const list = prohibitedIntervals({ ...real, zawalStart: new Date(real.solarNoon - 360000), zawalEnd: new Date(real.solarNoon.getTime() + 360000) });
  assert.equal(list.length, 3);
  assert.equal(list[2].end.getTime(), real.sunset.getTime());
});

test('the live notice is the violet forbidden card; the old timetable rows and gold notice are gone', () => {
  assert.match(css, /\.forbidden-card \{/);
  assert.doesNotMatch(css, /\.prohibited-now|\.time-row/);
  assert.doesNotMatch(app, /\['Sunrise', 'sunrise', 'Prohibited interval'\]/);
});
