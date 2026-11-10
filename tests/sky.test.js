import test from 'node:test';
import assert from 'node:assert/strict';
import { julianDay, sunPosition, moonPhase, phaseName, moonEquatorial, moonPosition, sunTimes, moonPass, passFraction, arcPoint, arcPath, skyWeights, sunIntensity, starField, moonLitPath, timeArcPoint, timeArcPath, zoneSpans, zoneRect, zonePath } from '../src/sky.js';
import { calculatePrayerTimes } from '../src/prayer-engine.js';
import { readText } from './helpers/read-text.js';

const utc = (...a) => new Date(Date.UTC(...a));

test('Julian day: J2000.0 and the Unix epoch', () => {
  assert.equal(julianDay(utc(2000, 0, 1, 12)), 2451545.0);
  assert.equal(julianDay(utc(1970, 0, 1)), 2440587.5);
});

test('sun declination at the equinoxes and solstices (astronomical almanac values)', () => {
  assert.ok(Math.abs(sunPosition(utc(2024, 2, 20, 3, 6), 0, 0).declination) < 0.1, 'March equinox 2024-03-20 03:06 UTC');
  assert.ok(Math.abs(sunPosition(utc(2024, 8, 22, 12, 44), 0, 0).declination) < 0.1, 'September equinox 2024-09-22 12:44 UTC');
  assert.ok(Math.abs(sunPosition(utc(2024, 5, 20, 20, 51), 0, 0).declination - 23.44) < 0.05, 'June solstice');
  assert.ok(Math.abs(sunPosition(utc(2024, 11, 21, 9, 21), 0, 0).declination + 23.44) < 0.05, 'December solstice');
  assert.ok(Math.abs(sunPosition(utc(2026, 10, 13, 6), 0, 0).declination + 18.0) < 0.5, '13 Nov 2026 is about 18 degrees south (almanac: -18.1)');
});

test('sun altitude: near the zenith at the equator at the equinox, below the horizon at local midnight', () => {
  const noon = sunPosition(utc(2024, 2, 20, 12, 7), 0, 0); // equation of time about -7.5 min, so true solar noon is 12:07 UTC
  assert.ok(noon.altitude > 88, `altitude ${noon.altitude}`);
  const midnight = sunPosition(utc(2024, 2, 20, 0, 7), 0, 0);
  assert.ok(midnight.altitude < -85);
});

test('sun at solar noon in Dhaka on 13 Nov 2026: altitude = 90 - (lat - dec), due south', () => {
  // Dhaka 23.81 N 90.41 E; solar noon is about 05:48 UTC (11:48 in UTC+6)
  let best = null;
  for (let m = 5 * 60 + 30; m <= 6 * 60 + 10; m++) {
    const p = sunPosition(utc(2026, 10, 13, 0, m), 23.8103, 90.4125);
    if (!best || p.altitude > best.p.altitude) best = { m, p };
  }
  const dec = best.p.declination;
  assert.ok(Math.abs(best.p.altitude - (90 - (23.8103 - dec))) < 0.3, `${best.p.altitude}`);
  assert.ok(best.p.altitude > 47 && best.p.altitude < 49.5);
  assert.ok(Math.abs(best.p.azimuth - 180) < 2, `azimuth ${best.p.azimuth}`);
  assert.ok(best.m >= 5 * 60 + 40 && best.m <= 5 * 60 + 52, `solar noon at ${best.m} min after 00:00 UTC`);
});

test('sun azimuth at the equinox sunrise and sunset at the equator is due east and due west', () => {
  assert.ok(Math.abs(sunPosition(utc(2024, 2, 20, 6, 0), 0, 0).azimuth - 90) < 4);
  assert.ok(Math.abs(sunPosition(utc(2024, 2, 20, 18, 14), 0, 0).azimuth - 270) < 4);
});

test('moon phase against known new and full moons', () => {
  const news = [utc(2000, 0, 6, 18, 14), utc(2024, 3, 8, 18, 21), utc(2026, 10, 9, 21, 2)];
  const fulls = [utc(2000, 0, 21, 4, 40), utc(2024, 3, 23, 23, 49), utc(2026, 10, 24, 14, 53)];
  for (const d of news) assert.ok(moonPhase(d).illumination < 0.01, `${d.toISOString()} ${moonPhase(d).illumination}`);
  for (const d of fulls) assert.ok(moonPhase(d).illumination > 0.99, `${d.toISOString()} ${moonPhase(d).illumination}`);
});

test('moon phase: Meeus example 48.a (1992 April 12, 0h TD) gives k = 0.679', () => {
  const p = moonPhase(utc(1992, 3, 12, 0, 0));
  assert.ok(Math.abs(p.illumination - 0.6786) < 0.01, `${p.illumination}`);
  assert.equal(p.waxing, true, 'new moon 3 April, full moon 17 April: waxing gibbous');
});

test('moon quarters are half lit; waxing between new and full, waning after', () => {
  const firstQ = moonPhase(utc(2024, 3, 15, 19, 13));
  const lastQ = moonPhase(utc(2024, 4, 1, 11, 27));
  assert.ok(Math.abs(firstQ.illumination - 0.5) < 0.03 && firstQ.waxing);
  assert.ok(Math.abs(lastQ.illumination - 0.5) < 0.03 && !lastQ.waxing);
  assert.equal(phaseName(firstQ), 'first-quarter');
  assert.equal(phaseName(lastQ), 'last-quarter');
  assert.equal(phaseName(moonPhase(utc(2024, 3, 8, 18, 21))), 'new');
  assert.equal(phaseName(moonPhase(utc(2024, 3, 23, 23, 49))), 'full');
  assert.equal(phaseName(moonPhase(utc(2024, 3, 11))), 'waxing-crescent');
  assert.equal(phaseName(moonPhase(utc(2024, 3, 19))), 'waxing-gibbous');
  assert.equal(phaseName(moonPhase(utc(2024, 3, 26))), 'waning-gibbous');
  assert.equal(phaseName(moonPhase(utc(2024, 4, 3))), 'waning-crescent');
});

test('one synodic month later the phase repeats (29.53 days, within the moon’s usual 14 hour wobble)', () => {
  const a = moonPhase(utc(2025, 0, 29, 12, 36)); // new moon
  assert.ok(a.illumination < 0.01);
  for (let day = 0; day < 40; day++) { const p = moonPhase(utc(2025, 0, 1 + day)); assert.ok(p.illumination >= 0 && p.illumination <= 1); }
});

test('sunrise and sunset against references: London 21 June 2024 (03:43 / 20:21 UTC) and the equinox at the equator (about 06:04 / 18:10 UTC)', () => {
  const london = sunTimes(utc(2024, 5, 21), 51.5074, -0.1278);
  const minutes = d => d.getUTCHours() * 60 + d.getUTCMinutes();
  assert.ok(Math.abs(minutes(london.sunrise) - (3 * 60 + 43)) <= 2, london.sunrise.toISOString());
  assert.ok(Math.abs(minutes(london.sunset) - (20 * 60 + 21)) <= 2, london.sunset.toISOString());
  const eq = sunTimes(utc(2024, 2, 20), 0, 0);
  assert.ok(Math.abs(minutes(eq.sunrise) - (6 * 60 + 4)) <= 3 && Math.abs(minutes(eq.sunset) - (18 * 60 + 10)) <= 3);
  const polar = sunTimes(utc(2024, 5, 21), 78.2, 15.6); // Svalbard: midnight sun
  assert.deepEqual(polar, { sunrise: null, sunset: null });
});

test('sunrise and sunset agree with the app’s prayer engine for Dhaka (within 2 minutes)', () => {
  // The engine reports device-local clock times, so compare clock minutes (Dhaka = UTC+6) rather than instants: independent of the machine zone.
  const mine = sunTimes(new Date(Date.UTC(2026, 10, 12, 18, 0, 0)), 23.8103, 90.4125); // 00:00 in UTC+6
  const engine = calculatePrayerTimes(new Date(2026, 10, 13, 12), 23.8103, 90.4125, 360, { fajrAngle: 18, ishaAngle: 18, asrFactor: 2 });
  const dhakaMin = d => (((d.getUTCHours() * 60 + d.getUTCMinutes() + 360) % 1440) + 1440) % 1440;
  const localMin = d => d.getHours() * 60 + d.getMinutes();
  assert.ok(Math.abs(dhakaMin(mine.sunrise) - localMin(engine.sunrise)) <= 2, `${mine.sunrise.toISOString()} ${engine.sunrise}`);
  assert.ok(Math.abs(dhakaMin(mine.sunset) - localMin(engine.sunset)) <= 2, `${mine.sunset.toISOString()} ${engine.sunset}`);
});

test('moon position: Meeus example 47.a (12 April 1992) within the low-precision series’ tolerance (about 2 degrees)', () => {
  const e = moonEquatorial(utc(1992, 3, 12, 0, 0, 0));
  assert.ok(Math.abs(e.ra - 134.688) < 2.2, `ra ${e.ra}`);
  assert.ok(Math.abs(e.dec - 13.768) < 0.8, `dec ${e.dec}`);
  assert.ok(Math.abs(e.distance - 368410) < 6000, `distance ${e.distance}`);
});

test('moon rise and set around the full moon of 23 April 2024 (London): rises near sunset, sets near sunrise, culminates high in the south at night', () => {
  const lat = 51.5074, lon = -0.1278;
  const pass = moonPass(utc(2024, 3, 23, 21, 0), lat, lon);
  assert.equal(pass.up, true);
  const h = d => d.getUTCHours() + d.getUTCMinutes() / 60 + (d.getUTCDate() - 23) * 24;
  assert.ok(h(pass.rise) > 17.5 && h(pass.rise) < 20.5, `rise ${pass.rise.toISOString()} (sunset is 19:45 UTC)`);
  assert.ok(h(pass.set) > 28 && h(pass.set) < 30.5, `set ${pass.set.toISOString()} (sunrise is 04:50 UTC)`);
  const mid = new Date((pass.rise.getTime() + pass.set.getTime()) / 2);
  const p = moonPosition(mid, lat, lon);
  assert.ok(p.altitude > 18 && p.altitude < 32, `altitude ${p.altitude}`);
  assert.ok(Math.abs(p.azimuth - 180) < 12, `azimuth ${p.azimuth}`);
  assert.ok(moonPosition(pass.rise, lat, lon).altitude < -0.5 && moonPosition(new Date(pass.rise.getTime() + 1800000), lat, lon).altitude > -0.8);
  const f = passFraction(pass.rise, pass.set, mid);
  assert.ok(Math.abs(f - 0.5) < 1e-6);
});

test('moon pass when the moon is down: the next rise, then its set; a new moon rises and sets with the sun', () => {
  const lat = 23.8103, lon = 90.4125;
  const down = moonPass(utc(2026, 10, 13, 16, 0), lat, lon); // 22:00 in Dhaka, after moonset
  assert.equal(down.up, false);
  assert.ok(down.rise > utc(2026, 10, 13, 16, 0) && down.set > down.rise);
  const newMoon = sunTimes(utc(2026, 10, 9, 0, 0), lat, lon);
  const pass = moonPass(utc(2026, 10, 9, 8, 0), lat, lon);
  assert.ok(Math.abs(pass.rise - newMoon.sunrise) < 3 * 3600000, 'new moon rises near sunrise');
});

test('arc: the body enters at the left horizon, peaks in the middle, leaves at the right, and slows near the horizon', () => {
  const a0 = arcPoint(0, 400, 50, 10, 20), a1 = arcPoint(1, 400, 50, 10, 20), m = arcPoint(0.5, 400, 50, 10, 20);
  assert.deepEqual([Math.round(a0.x), Math.round(a0.y)], [20, 50]);
  assert.deepEqual([Math.round(a1.x), Math.round(a1.y)], [380, 50]);
  assert.deepEqual([Math.round(m.x), Math.round(m.y)], [200, 10]);
  assert.ok(arcPoint(0.1, 400, 50, 10, 20).x - a0.x < arcPoint(0.5, 400, 50, 10, 20).x - arcPoint(0.4, 400, 50, 10, 20).x, 'slower near the horizon');
  assert.equal(arcPath(400, 50, 10, 20), 'M20 50A180 40 0 0 1 380 50');
});

test('sky colour weights: deep night, a warm twilight, full day; stars only in the dark', () => {
  assert.deepEqual(skyWeights(-30), { night: 1, twilight: 0, day: 0 });
  assert.equal(skyWeights(-6).night, 0, 'stars are gone by the end of civil twilight');
  const dawn = skyWeights(-2);
  assert.ok(dawn.twilight > 0.95 && dawn.night === 0 && dawn.day < 0.1);
  const noon = skyWeights(60);
  assert.deepEqual([noon.night, noon.twilight, noon.day], [0, 0, 1]);
  assert.ok(skyWeights(-10).night > 0 && skyWeights(-10).night < 1);
});

test('sun glow is strongest at the day’s highest point and dim at the horizon', () => {
  assert.equal(sunIntensity(48, 48), 1);
  assert.ok(sunIntensity(20, 48) < sunIntensity(40, 48));
  assert.ok(sunIntensity(2, 48) <= 0.4);
  assert.ok(sunIntensity(-5, 48) < 0.01);
});

test('stars are deterministic, in range, and some twinkle', () => {
  const a = starField(), b = starField();
  assert.deepEqual(a, b);
  assert.equal(a.length, 96, 'many small stars');
  assert.deepEqual([0, 1, 2].map(k => a.some(star => star.layer === k)), [true, true, true], 'three layers');
  assert.ok(a.every(star => star.r === [0.75, 1.05, 1.45][star.layer]));
  assert.ok(a.every(s => s.r >= 0.7), 'clearly visible');
  for (const s of a) assert.ok(s.x >= 0 && s.x <= 1 && s.y >= 0.05 && s.y <= 0.85 && s.r > 0);
  assert.ok(a.filter(s => s.twinkle).length >= 10 && a.some(s => !s.twinkle));
  assert.notDeepEqual(starField(96, 1), a);
});

test('moon drawing: full is a whole disc, new is empty, quarters have a straight terminator, waxing is lit on the right (mirrored in the south)', () => {
  assert.match(moonLitPath(0.5, true, 10, 10, 8), /A0 8 0 0 [01] 10 2Z$/, 'straight terminator at half');
  assert.match(moonLitPath(1, true, 10, 10, 8), /A8 8 0 0 1 10 2Z$/, 'full: the terminator is the far limb');
  assert.match(moonLitPath(0, true, 10, 10, 8), /A8 8 0 0 0 10 2Z$/, 'new: zero area');
  assert.match(moonLitPath(0.3, true, 10, 10, 8), /^M10 2A8 8 0 0 1 10 18A3.2 8 0 0 0 10 2Z$/, 'waxing crescent: lit on the right, thin');
  assert.match(moonLitPath(0.3, false, 10, 10, 8), /^M10 2A8 8 0 0 0 10 18A3.2 8 0 0 1 10 2Z$/, 'waning crescent: lit on the left');
  assert.equal(moonLitPath(0.3, true, 10, 10, 8, true), moonLitPath(0.3, false, 10, 10, 8), 'southern hemisphere mirrors');
});

const HZ = 100, APEX = 20, MARGIN = 10, WIDTH = 1010;

test('time axis: x is linear in time, the path is a smooth half-wave peaking at the middle (the old elliptical arcPoint is unchanged)', () => {
  for (const f of [0, 0.1, 0.25, 0.5, 0.9, 1]) assert.ok(Math.abs(timeArcPoint(f, WIDTH, HZ, APEX, MARGIN).x - (MARGIN + 990 * f)) < 1e-9);
  assert.equal(timeArcPoint(0, WIDTH, HZ, APEX, MARGIN).y, HZ);
  assert.ok(Math.abs(timeArcPoint(1, WIDTH, HZ, APEX, MARGIN).y - HZ) < 1e-9);
  assert.equal(timeArcPoint(0.5, WIDTH, HZ, APEX, MARGIN).y, APEX);
  assert.ok(timeArcPath(WIDTH, HZ, APEX, MARGIN).startsWith('M10 100L'));
});

test('forbidden zones: each zone’s width is exactly proportional to its real duration on the time axis', () => {
  const T = Date.UTC(2026, 10, 13, 0, 8, 0), MIN = 60000; // sunrise 06:08 Dhaka
  const rise = new Date(T), set = new Date(T + 10 * 3600000 + 48 * MIN); // a 10 h 48 min day
  const iv = [
    { key: 'sunrise', start: rise, end: new Date(T + 20 * MIN) },
    { key: 'zawal', start: new Date(T + 5 * 3600000 + 18 * MIN), end: new Date(T + 5 * 3600000 + 30 * MIN) },
    { key: 'sunset', start: new Date(set.getTime() - 15 * MIN), end: set }
  ];
  const zones = zoneSpans(iv, rise, set);
  assert.deepEqual(zones.map(z => z.key), ['sunrise', 'zawal', 'sunset']);
  const day = set - rise;
  const boxes = zones.map(z => zoneRect(z, WIDTH, MARGIN));
  zones.forEach((z, i) => {
    const dur = iv[i].end - iv[i].start;
    assert.ok(Math.abs((z.f1 - z.f0) - dur / day) < 1e-12, `${z.key}: f-extent = duration / daylight`);
    assert.ok(Math.abs(boxes[i].width - (WIDTH - 2 * MARGIN) * dur / day) < 1e-9, `${z.key}: pixel width = duration share of the axis`);
  });
  // proportional across zones: width ratio equals duration ratio
  assert.ok(Math.abs(boxes[0].width / boxes[1].width - 20 / 12) < 1e-9);
  assert.ok(Math.abs(boxes[2].width / boxes[1].width - 15 / 12) < 1e-9);
  // and positioned where the sun is at that time: the sun at the start second sits at the zone's left edge
  zones.forEach((z, i) => assert.ok(Math.abs(timeArcPoint((iv[i].start - rise) / day, WIDTH, HZ, APEX, MARGIN).x - boxes[i].x) < 1e-9));
  // the highlight path starts and ends exactly at the zone ends
  const d = zonePath(zones[1].f0, zones[1].f1, WIDTH, HZ, APEX, MARGIN);
  const first = d.match(/^M([\d.]+) ([\d.]+)/), last = d.match(/L([\d.]+) ([\d.]+)$/);
  assert.ok(Math.abs(Number(first[1]) - boxes[1].x) < 0.01);
  assert.ok(Math.abs(Number(last[1]) - (boxes[1].x + boxes[1].width)) < 0.01);
});

test('zones outside the daylight span are clipped and empty or invalid input gives no zones', () => {
  const rise = new Date(1000000), set = new Date(1000000 + 3600000);
  assert.deepEqual(zoneSpans([{ key: 'x', start: new Date(1000000 - 600000), end: new Date(1000000 + 360000) }], rise, set).map(z => [z.f0, z.f1]), [[0, 0.1]]);
  assert.deepEqual(zoneSpans([{ key: 'x', start: new Date(set.getTime() + 1), end: new Date(set.getTime() + 999) }], rise, set), []);
  assert.deepEqual(zoneSpans([], rise, set), []);
  assert.deepEqual(zoneSpans(null, rise, set), []);
  assert.deepEqual(zoneSpans([{ key: 'x', start: rise, end: set }], set, rise), []);
});

test('wiring: one soft SVG sky panel (rounded, multi-stop gradients, feathered zones, markers), offline, minute updates, hidden-pause and reduced-motion safe', () => {
  const html = readText('../index.html', import.meta.url);
  const app = readText('../src/app.js', import.meta.url);
  const css = readText('../src/styles.css', import.meta.url);
  const panel = html.slice(html.indexOf('id="skyPanel"'), html.indexOf('</section>', html.indexOf('id="skyPanel"')));
  assert.ok(html.indexOf('</header>') < html.indexOf('id="skyPanel"') && html.indexOf('id="skyPanel"') < html.indexOf('<main id="homeView">'), 'between the header (top clock) and the page');
  assert.equal((panel.match(/<svg\b/g) || []).length, 1, 'one SVG, nothing else drawn');
  assert.equal((panel.match(/class="sky-cloud /g) || []).length, 3, 'three clouds');
  assert.match(panel, /<linearGradient id="skyGLive"[^>]*>(<stop[^>]*\/>){3}<\/linearGradient>/, 'one live multi-stop gradient driven by the sun altitude');
  assert.match(panel, /id="skyHorizonGlow"/); assert.match(panel, /id="skyZones"/); assert.match(panel, /class="sky-sun-star"/, 'the sun is an 8-point star');
  assert.doesNotMatch(panel, /skyMarkRise|skyMarkSet|sky-marks/, 'no square-ish edge marks (v1.3.4)');
  assert.doesNotMatch(panel, /sky-halo|skyRays|sky-rays/, 'no hard rays or stepped halos');
  assert.match(css, /\.sky-panel \{[^}]*border-radius:1\.15rem/, 'rounded panel corners');
  assert.match(css, /clip-path:inset\(0 round 1\.15rem\)/, 'everything is clipped to the rounded shape, no square corners');
  assert.doesNotMatch(css, /crispEdges/);
  assert.match(app, /color-mix\(in srgb, \$\{hex\} 94%, var\(--accent\)\)/, 'live sky colours are mixed with the theme accent');
  assert.match(css, /--forbidden: color-mix\(in srgb, var\(--accent\) 12%, #9a4dff\)/, 'stronger violet');
  assert.match(css, /\.sky-zone \.zb \{ fill:url\(#skyZoneG\); filter:url\(#skyFeather\); \}/, 'feathered violet zones');
  assert.match(app, /zoneRect\(zone, W, margin\)/, 'zone width comes from the tested proportional helper');
  assert.match(app, /zoneSpans\(prohibitedIntervals\(times\), times\.sunrise, times\.sunset\)/);
  assert.match(app, /function updateSky\(force = false\)/);
  assert.match(app, /if \(!force && key === lastSkyKey\) return;/, 'redrawn only when the minute (or size, language, clock format) changes');
  assert.match(app, /Math\.floor\(now\.getTime\(\) \/ 60000\)/);
  assert.match(app, /updateSky\(\);\n\}/, 'driven by the clock tick');
  assert.match(app, /classList\.toggle\('page-hidden', document\.hidden\)/);
  assert.match(css, /\.page-hidden \.sky-star, \.page-hidden \.sky-cloud, \.page-hidden \.sky-zone \{ animation-play-state:paused; \}/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.sky-star\.tw, \.sky-cloud, \.sky-zone\.is-active \{ animation:none; \}/, 'static under reduced motion');
  assert.match(css, /@keyframes sky-drift \{ from \{ transform:translateX\(-130px\); \} to \{ transform:translateX\(var\(--sky-w\)\); \} \}/, 'clouds animate transform only');
  assert.match(css, /@keyframes sky-twinkle \{ from \{ opacity:\.35; \} to \{ opacity:1; \} \}/, 'stars animate opacity only');
  assert.match(css, /@keyframes sky-zone-pulse \{ from \{ opacity:\.78; \} to \{ opacity:1; \} \}/);
  assert.match(css, /\.sky-panel\[data-stars="off"\] \.sky-stars \{ display:none; \}/, 'no star cost by day');
  assert.match(css, /\.sky-moon\.is-faint/, 'a translucent moon by day');
  assert.match(app, /const ub = u \* 2\.9;/, 'sun and moon are large');
  const body = app.slice(app.indexOf('function updateSky'), app.indexOf('function fardDisplayName'));
  assert.doesNotMatch(body, /fetch\(|XMLHttpRequest|https?:/);
  assert.match(body, /moonLitPath\(phase\.illumination, phase\.waxing, 0, 0, 3\.9, state\.lat < 0\)/);
  assert.match(body, /Math\.max\(0, Math\.round\(sun\.altitude\)\)/, 'never "-1° above the horizon"');
  assert.match(body, /বর্ধমান|PHASE_NAMES/);
});
