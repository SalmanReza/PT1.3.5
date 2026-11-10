import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { LAYER_COLORS, LAYER_ORDER, OUTER_EDGE, CENTER, figureLayout, ringGaps, arcSegments, progressSummary, figureSvg, figureChanges, REWARD_TEXT } from '../src/progress-figure.js';
import { readText } from './helpers/read-text.js';

const all = n => Array(n).fill(true);
const none = n => Array(n).fill(false);
const some = (n, k) => Array.from({ length: n }, (_, i) => i < k);
const full = { fard: all(5), sunnah: all(5), nafl: all(5), voluntary: all(5) };
const count = list => ({ done: list.filter(Boolean).length, total: list.length });
const summarise = flags => progressSummary(Object.fromEntries(Object.entries(flags).map(([k, v]) => [k, count(v)])));

test('approved colours, inside to outside: white, green, black, striped red-black, saffron', () => {
  assert.deepEqual(LAYER_ORDER, ['fard', 'sunnah', 'nafl', 'voluntary', 'seasonal']);
  assert.equal(LAYER_COLORS.fard, '#F7F4EC');
  assert.equal(LAYER_COLORS.fardOutline, '#BDB6A6');
  assert.equal(LAYER_COLORS.sunnah, '#1E8E5A');
  assert.equal(LAYER_COLORS.nafl, '#141414');
  assert.equal(LAYER_COLORS.hillahRed, '#B3122E');
  assert.equal(LAYER_COLORS.seasonal, '#E8A33D');
});

test('mock-up proportions (72/89/108/129 in a 300 box), even gaps, constant diameter with a 5th ring', () => {
  const four = figureLayout(false);
  assert.deepEqual(four.layers, ['fard', 'sunnah', 'nafl', 'voluntary']);
  assert.deepEqual(['fard', 'sunnah', 'nafl', 'voluntary'].map(k => four.rings[k].r), [72, 89, 108, 129]);
  for (const k of four.layers) assert.ok(four.rings[k].w >= 10 && four.rings[k].w <= 16);
  const gaps4 = ringGaps(four);
  assert.ok(Math.max(...gaps4) - Math.min(...gaps4) <= 1.5, `even gaps ${gaps4}`);
  assert.ok(gaps4.every(gap => gap > 4), 'no rings touch');
  const five = figureLayout(true);
  assert.equal(five.layers.at(-1), 'seasonal');
  const edge = layout => layout.rings[layout.layers.at(-1)].r + layout.rings[layout.layers.at(-1)].w / 2;
  assert.equal(Math.round(edge(four)), OUTER_EDGE);
  assert.equal(Math.round(edge(five)), OUTER_EDGE, 'diameter constant when the saffron ring appears');
  assert.ok(five.scale < 1);
  assert.ok(ringGaps(five).every(gap => gap > 4));
  assert.ok(OUTER_EDGE < CENTER, 'fits inside the view box');
});

test('every ring fills clockwise from 12 o’clock, one segment per item, never closing early', () => {
  for (let total = 1; total <= 8; total++) {
    for (let done = 0; done < total; done++) {
      const ring = arcSegments(some(total, done), 100, 12);
      assert.equal(ring.segments.length, total);
      assert.equal(ring.complete, false, `${done}/${total} must stay open`);
      assert.ok(ring.gapUnits > 2 * ring.capUnits, 'gap is wider than both round caps');
      assert.deepEqual(ring.segments.map(s => s.done), some(total, done), 'segment i = item i');
      ring.segments.forEach((segment, i) => assert.ok(Number(segment.dashoffset) <= -(i * 100 / total), 'clockwise order from 12'));
    }
    assert.equal(arcSegments(all(total), 100, 12).complete, true);
  }
  assert.equal(arcSegments([], 100, 12).segments.length, 0);
});

test('figure states: tracks, lit segments, closed rings, white disc after the 5th Fard', () => {
  const svg = figureSvg({ fard: some(5, 3), sunnah: some(5, 2), nafl: none(5), voluntary: some(5, 1) });
  assert.equal((svg.match(/class="pf-seg fard done/g) || []).length, 3);
  assert.equal((svg.match(/class="pf-track fard"/g) || []).length, 2);
  assert.equal((svg.match(/class="pf-seg sunnah done/g) || []).length, 2);
  assert.equal((svg.match(/class="pf-track nafl"/g) || []).length, 5);
  assert.doesNotMatch(svg, /closed/);
  assert.doesNotMatch(svg, /pf-disc/);
  assert.doesNotMatch(svg, /seasonal/, 'no saffron ring without date-specific prayers');
  const disc = figureSvg({ ...full, fard: all(5), sunnah: some(5, 4) });
  assert.match(disc, /class="pf-disc"/);
  assert.match(disc, /pf-ring nafl closed/);
  assert.doesNotMatch(disc, /pf-ring sunnah closed/);
  assert.doesNotMatch(disc, /pf-reward/);
  const done = figureSvg(full);
  assert.match(done, /class="pf-reward"[^>]*>الحمد لله</);
  assert.match(done, /pf-ring voluntary closed/);
  assert.doesNotMatch(figureSvg(full, { mini: true }), /pf-reward/, 'mini weekly figures carry no text');
});

test('untick reverts: one fewer segment, ring reopens, disc and reward disappear', () => {
  const reverted = figureSvg({ ...full, fard: some(5, 4) });
  assert.doesNotMatch(reverted, /pf-disc|pf-reward/);
  assert.equal((reverted.match(/pf-seg fard done/g) || []).length, 4);
});

test('sweep animates only the newly ticked segment; glow-in only on the ring that just closed', () => {
  const before = { fard: some(5, 4), sunnah: some(5, 1), nafl: none(5), voluntary: none(5) };
  const after = { ...before, fard: all(5), sunnah: some(5, 2) };
  const { sweep, closing } = figureChanges(before, after);
  assert.deepEqual([...sweep].sort(), ['fard:4', 'sunnah:1']);
  assert.deepEqual([...closing], ['fard']);
  assert.equal(figureChanges(after, after).sweep.size, 0, 're-render without changes does not re-animate');
  const svg = figureSvg(after, { sweep, closing });
  assert.match(svg, /pf-seg sunnah done sweep/);
  assert.match(svg, /pf-disc closing/);
});

test('Good Job = all Fard; Great Job and الحمد لله = every layer present that day', () => {
  assert.equal(REWARD_TEXT, 'الحمد لله');
  assert.equal(summarise(full).reward, true);
  assert.equal(summarise(full).great, true);
  for (const layer of ['fard', 'sunnah', 'nafl', 'voluntary']) {
    const missing = summarise({ ...full, [layer]: some(5, 4) });
    assert.equal(missing.reward, false, `${layer} incomplete`);
    assert.equal(missing.good, layer !== 'fard');
  }
  assert.equal(summarise({ ...full, voluntary: [] }).reward, false, 'no voluntary data (no location): no reward');
  // Date-specific day: the saffron ring must be complete too.
  assert.equal(summarise({ ...full, seasonal: [true, false] }).reward, false);
  assert.equal(summarise({ ...full, seasonal: [true, true] }).reward, true);
  assert.equal(summarise({ ...full, seasonal: [] }).hasSeasonal, false);
  const saffron = figureSvg({ ...full, seasonal: [false] });
  assert.match(saffron, /pf-track seasonal/);
  assert.match(saffron, /has-seasonal/);
  assert.doesNotMatch(saffron, /pf-reward/);
});

test('markup, shared colour tokens and the local Aref Ruqaa reward font', () => {
  const html = readText('../index.html', import.meta.url);
  const css = readText('../src/styles.css', import.meta.url);
  const app = readText('../src/app.js', import.meta.url);
  for (const id of ['progressFigure', 'progressCore', 'progressVisual', 'hillahStripes', 'legendSeasonal']) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(app, /figureSvg\(flags, \{ sweep: changes\.sweep, closing: changes\.closing, rewardFade \}\)/);
  // One set of tokens drives the rings, the tick circles and the legend.
  for (const token of ['--layer-fard', '--layer-sunnah', '--layer-nafl', '--layer-hillah', '--layer-seasonal']) {
    assert.match(css, new RegExp(`\\.pf-seg\\.[a-z]+ \\{ stroke: var\\(${token}\\)|url\\(#hillahStripes\\)`));
    assert.ok(css.includes(`var(${token})`), token);
  }
  assert.match(css, /\.part-tick\.sunnah\.done i \{ background: var\(--layer-sunnah\); \}/);
  assert.match(css, /\.part-tick\.nafl\.done i \{ background: var\(--layer-nafl\); \}/);
  assert.match(css, /\.round-check\.layer-voluntary\[aria-pressed="true"\] \{[^}]*var\(--layer-hillah\)/);
  assert.match(css, /\.round-check\.layer-seasonal\[aria-pressed="true"\] \{[^}]*var\(--layer-seasonal\)/);
  assert.match(css, /body\[data-mode="light"\] \{\n  --layer-fard: #F3EEE2; --layer-fard-line: #BDB6A6; --layer-fard-edge: #BDB6A6;/);
  assert.match(css, /--layer-nafl-edge: rgba\(255,255,255,\.42\)/, 'black ring gets a light edge on dark themes');
  assert.match(css, /@keyframes pf-sweep \{ from \{ stroke-dasharray: 0 100; \} \}/);
  assert.match(css, /\.pf \.sweep \{ animation: pf-sweep \.4s/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /font-family: "Alhamdulillah Ruqaa"/);
  assert.match(css, /url\("\.\/fonts\/alhamdulillah-aref-ruqaa\.woff"\)/);
  assert.doesNotMatch(css.replaceAll('http://www.w3.org/2000/svg', ''), /https?:\/\//, 'no remote fonts or assets (the SVG namespace in data: URIs is not a request)');
  assert.ok(fs.statSync(new URL('../src/fonts/alhamdulillah-aref-ruqaa.woff', import.meta.url)).size < 20000, 'bundled font stays tiny');
  assert.ok(fs.existsSync(new URL('../src/fonts/ArefRuqaa-OFL.txt', import.meta.url)), 'font licence is bundled');
  assert.ok(!fs.existsSync(new URL('../src/fonts/alhamdulillah-amiri.woff', import.meta.url)), 'unused Amiri subset removed');
});

test('Today’s progress follows the prayer day until Fajr', () => {
  const app = readText('../src/app.js', import.meta.url);
  assert.match(app, /function progressDate\(now = new Date\(\)\)/);
  assert.match(app, /now < times\.fajr \? addDays\(today, -1\) : today/);
  assert.match(app, /const day = progressDate\(new Date\(\)\)/);
});
