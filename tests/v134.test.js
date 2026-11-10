import test from 'node:test';
import assert from 'node:assert/strict';
import { skyColors, STAR8_PATH, zoneSpans, timeArcPoint } from '../src/sky.js';
import { notificationNotes, notificationPlan, tickPlan, NOTIFICATION_VOLUME } from '../src/sound.js';
import { prohibitedIntervals } from '../src/forbidden-times.js';
import { readText } from './helpers/read-text.js';

const css = readText('../src/styles.css', import.meta.url);
const html = readText('../index.html', import.meta.url);
const app = readText('../src/app.js', import.meta.url);
const rust = readText('../src-tauri/src/main.rs', import.meta.url);

const lum = hex => { const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };

test('sky colour follows the sun altitude: dark at night, bright at midday, warm at sunrise/sunset, continuous in between', () => {
  const night = skyColors(-30, true), noon = skyColors(60, true), rise = skyColors(0.5, true), set = skyColors(0.5, false);
  assert.ok(lum(night[1]) < 40 && lum(noon[1]) > 150, 'night is dark, midday is bright');
  assert.ok(parseInt(rise[2].slice(1, 3), 16) > parseInt(rise[2].slice(5, 7), 16) + 40, 'sunrise horizon is warm (red above blue)');
  assert.ok(parseInt(set[2].slice(1, 3), 16) > parseInt(set[2].slice(5, 7), 16) + 60, 'sunset horizon is warm');
  assert.notDeepEqual(skyColors(15, true), skyColors(15, false), 'morning and golden afternoon differ');
  assert.deepEqual(skyColors(40, true), skyColors(40, false), 'midday is shared');
  for (const rising of [true, false]) {
    let prev = skyColors(-40, rising);
    for (let alt = -39.5; alt <= 60; alt += 0.5) {
      const next = skyColors(alt, rising);
      next.forEach((hex, i) => { for (const c of [1, 3, 5]) assert.ok(Math.abs(parseInt(hex.slice(c, c + 2), 16) - parseInt(prev[i].slice(c, c + 2), 16)) <= 24, `no jump at ${alt}`); });
      prev = next;
    }
  }
  assert.deepEqual(skyColors(NaN, true), skyColors(-90, true));
  assert.match(STAR8_PATH, /^M[-\d. L]+Z$/);
});

test('forbidden zones are exactly the intervals from forbidden-times.js (no padding), as fractions of sunrise to sunset', () => {
  const rise = Date.UTC(2026, 10, 13, 0, 0), set = rise + 11 * 3600000;
  const times = { sunrise: new Date(rise), sunset: new Date(set), zawalStart: new Date(rise + 5.5 * 3600000), dhuhr: new Date(rise + 5.75 * 3600000), asr: new Date(rise + 8 * 3600000) };
  const intervals = prohibitedIntervals(times);
  const zones = zoneSpans(intervals, times.sunrise, times.sunset);
  assert.equal(zones.length, intervals.length);
  zones.forEach((zone, i) => {
    assert.ok(Math.abs(zone.f0 - Math.max(0, (intervals[i].start.getTime() - rise) / (set - rise))) < 1e-9);
    assert.ok(Math.abs(zone.f1 - Math.min(1, (intervals[i].end.getTime() - rise) / (set - rise))) < 1e-9);
  });
  assert.equal(timeArcPoint(0, 800, 50, 10, 14).x, 14);
  assert.match(app, /zoneSpans\(prohibitedIntervals\(times\), times\.sunrise, times\.sunset\)/, 'the sky uses the same function as the rules');
  assert.match(app, /class', 'ze'/, 'crisp start and end lines');
});

test('sky shape: no leftover square marks, star-pattern frame, 8-point sun and stars, stronger violet', () => {
  assert.doesNotMatch(html, /sky-mark/);
  assert.match(html, /id="skyFrame"/, 'tile frame is part of the SVG');
  assert.match(html, /id="skyStar8"/);
  assert.match(app, /createElementNS\(SVG_NS, 'use'\); \/\/ v1\.3\.5: every star is a small tile star/);
  assert.match(css, /\.sky-svg \{[^}]*clip-path:inset\(0 round 1\.15rem\)/);
});

test('notification sound: same Fard voice as the tick, but louder, stronger and still short', () => {
  const notes = notificationNotes();
  assert.equal(notes.length, 3);
  assert.ok(notes.at(-1).at + 0.25 < 1, 'under one second');
  const loud = notificationPlan(3, 'wooden', () => 0.5), tick = tickPlan('fard', 3, 'wooden', () => 0.5);
  assert.ok(loud.volume >= 0.9 && loud.volume === NOTIFICATION_VOLUME && loud.volume > tick.volume * 1.5);
  assert.ok(loud.bodyGain > tick.bodyGain && loud.clickGain > tick.clickGain && loud.duration > tick.duration);
  assert.match(app, /type: 'notify'/);
  assert.match(app, /playNotificationSound\(\);\s+return \{ ok: true, how: typeof how/);
});

test('layout: one spacing scale, bigger clock, location subtitle, proportionate live card with a 20% larger Fard tick', () => {
  assert.match(css, /--sp-1: clamp\([^)]*\)[^}]*--sp-5: clamp\(/);
  assert.match(css, /\.top-date time \{[^}]*font-size: clamp\(1\.4rem/);
  assert.match(app, /`Location: \$\{coords\}`/);
  assert.match(app, /`অবস্থান: \$\{localizeDigits\(coords\)\}`/);
  assert.match(css, /--tk: calc\(var\(--live-fs\) \* 1\.45\)/);
  assert.match(css, /\.live-event \.part-tick i \{ width: var\(--tk\); height: var\(--tk\);/);
  assert.match(css, /\.live-event \.round-check \{ flex: 0 0 calc\(var\(--tk\) \* 1\.2\); width: calc\(var\(--tk\) \* 1\.2\); height: calc\(var\(--tk\) \* 1\.2\);/, 'Fard tick = 1.2 x Sunnah/Nafl tick');
  assert.doesNotMatch(css, /\.live-event::(before|after)/, 'v1.3.5: the old star band and arch watermark are gone');
  assert.doesNotMatch(css.slice(css.indexOf('===== v1.3.4')), /\.live-name \{ font-size: (2\.[2-9]|[3-9])/, 'name is not oversized');
});

test('fullscreen: Rust leaves the maximised state first and restores it; the page calls it and refreshes the pointer', () => {
  assert.match(rust, /async fn set_window_fullscreen\(app: tauri::AppHandle, fullscreen: bool\) -> Result<\(\), String>/, 'async: never on the event-loop thread');
  assert.match(rust, /spawn_blocking/);
  assert.match(rust, /window\.unmaximize\(\)/);
  assert.match(rust, /size\.height - 1/, '1 px bounce re-applies the WebView2 bounds');
  assert.match(rust, /WAS_MAXIMIZED\.swap\(false, Ordering::SeqCst\)/);
  assert.match(app, /invoke\('set_window_fullscreen', \{ fullscreen: value \}\)/);
  assert.match(app, /classList\.toggle\('is-fullscreen', value\)/);
});

test('v1.3.5 tilework: girih pattern in blue, turquoise and gold from CSS variables; edge-only ornament; tighter spacing; visible card toggles', () => {
  for (const id of ['tileGirih', 'tileGirihM', 'tileGirihS', 'tileArcade', 'tileArch']) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(css, /--tile-blue: color-mix\(in srgb, #1b3f96 74%, var\(--surface\)\); --tile-turq: color-mix\(in srgb, #17b3aa 72%, var\(--accent\)\); --tile-gold: color-mix\(in srgb, var\(--gold\)/);
  assert.match(app, /tile-band tile-top[\s\S]*tile-band tile-bottom[\s\S]*tile-arch/, 'live card gets bands and arch');
  assert.match(css, /\.live-event \.tile-band \{[^}]*pointer-events: none/, 'ornament never captures clicks');
  const upper = rem => Number(/clamp\([^,]+,[^,]+,\s*([\d.]+)rem\)/.exec(rem)[1]);
  const scale = css.match(/--sp-4: clamp\([^)]*\)/)[0];
  assert.ok(upper(scale) <= 0.95, 'spacing scale tightened (was 1.4rem)');
  assert.match(css, /--sp-1: clamp\(\.16rem/);
  assert.match(html, /id="skySun"[\s\S]*sky-sun-rays[\s\S]*sky-sun-star[\s\S]*sky-sun-star2/, 'gilded rosette with rays');
  assert.match(html, /id="skyScroll"/); assert.doesNotMatch(html, /<ellipse cx="50" cy="31"/, 'old blob clouds gone');
  assert.match(html, /#c8963c/, 'gold moon');
  const home = html.indexOf('id="homeCardsSettings"');
  assert.ok(home > html.indexOf('location-settings') && home < html.indexOf('calculation-profile'), 'toggles sit right after Prayer location, before the long method/appearance cards');
  assert.equal((html.match(/class="card-toggles"/g) || []).length, 3);
  assert.equal((html.match(/Cards in this tab/g) || []).length, 3);
  assert.match(app, /'Cards in this tab':'এই ট্যাবের কার্ডগুলো'/);
});

test('v1.3.5 fullscreen: the HTML Fullscreen API is never used, no full-viewport fixed overlay can swallow clicks, one toggle at a time', () => {
  assert.doesNotMatch(app, /requestFullscreen|exitFullscreen|fullscreenElement/);
  assert.doesNotMatch(css, /:fullscreen|:-webkit-full-screen/);
  assert.match(app, /fullscreenBusy/);
  assert.match(app, /desktopWindow\.setFullscreen\(value\); await desktopWindow\.setFocus\(\)/);
  // every position:fixed element is small (toast, copyright) and the toast does not take pointer events
  const fixed = [...css.matchAll(/([^{}\n]+)\{[^}]*position:\s*fixed[^}]*\}/g)].map(m => m[1].trim());
  assert.deepEqual(fixed.sort(), ['.copyright-corner', '.toast'].sort());
  assert.match(css, /\.copyright-corner \{[^}]*pointer-events:\s*none/);
  assert.doesNotMatch(css, /-webkit-app-region:\s*drag/);
});
