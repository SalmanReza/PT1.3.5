import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SUNNAH_SLOTS, NAFL_SLOTS, slotsForPrayer, slotLabel, slotShortLabel, fardPartLabel, prayerParts, layerState, findSlot, splitVoluntary, SEASONAL_KEYS } from '../src/prayer-layers.js';
import { readText } from './helpers/read-text.js';

const app = readText('../src/app.js', import.meta.url);
const html = readText('../index.html', import.meta.url);
const css = readText('../src/styles.css', import.meta.url);

test('blue layer = the Hanafi Sunnah mu’akkadah tied to the five Fard', () => {
  assert.deepEqual(SUNNAH_SLOTS.map(slot => `${slot.prayer}:${slot.key}`), ['fajr:fajr_before', 'dhuhr:dhuhr_before', 'dhuhr:dhuhr_after', 'maghrib:maghrib_after', 'isha:isha_after']);
  assert.equal(slotsForPrayer('sunnah', 'asr').length, 0, 'Asr has no emphasised Sunnah');
  const friday = new Date(2026, 10, 13);
  const tuesday = new Date(2026, 10, 10);
  assert.match(slotLabel(findSlot('sunnah', 'dhuhr_after'), friday, 'en'), /Jumu’ah: 4 \+ 2/);
  assert.equal(slotLabel(findSlot('sunnah', 'dhuhr_after'), tuesday, 'en'), '2 Sunnah after');
  assert.match(slotLabel(findSlot('sunnah', 'dhuhr_after'), friday, 'bn'), /জুমা/);
  for (const slot of [...SUNNAH_SLOTS, ...NAFL_SLOTS]) assert.ok(slot.en && slot.bn && /[০-৯]/.test(slot.bn), slot.key);
});

test('gold layer = Nafl tied to the prayers plus the ghayr mu’akkadah Sunnah of Asr and Isha', () => {
  assert.deepEqual(NAFL_SLOTS.map(slot => slot.key), ['dhuhr_nafl', 'asr_before', 'maghrib_nafl', 'isha_before', 'isha_nafl']);
  assert.equal(slotsForPrayer('nafl', 'fajr').length, 0, 'no Nafl after Fajr (prohibited until sunrise)');
  assert.match(findSlot('nafl', 'asr_before').en, /ghayr mu’akkadah/);
  // Witr and the standalone prayers stay in the green ring, not here.
  assert.ok(![...SUNNAH_SLOTS, ...NAFL_SLOTS].some(slot => /witr|duha|awwabin|tahajjud|qiyam/.test(slot.key)));
});

test('old history keeps working: voluntary records stay on the green ring, new layers start empty', () => {
  const legacy = { fard: { fajr: true }, voluntary: { duha: true, witr: true } };
  assert.equal(layerState(legacy, 'sunnah').done, 0);
  assert.equal(layerState(legacy, 'nafl').done, 0);
  assert.deepEqual(legacy.voluntary, { duha: true, witr: true });
  assert.match(app, /record\[layer\] \|\| \(record\[layer\] = \{\}\)/);
});


test('each layer state counts its own slots only', () => {
  for (const layer of ['sunnah', 'nafl']) {
    const keys = (layer === 'sunnah' ? SUNNAH_SLOTS : NAFL_SLOTS).map(slot => slot.key);
    for (let n = 0; n <= keys.length; n++) {
      const record = { [layer]: Object.fromEntries(keys.slice(0, n).map(key => [key, true])) };
      const state = layerState(record, layer);
      assert.equal(state.done, n);
      assert.equal(state.complete, n === keys.length);
    }
  }
  assert.equal(layerState({}, 'sunnah').done, 0);
  assert.equal(layerState(undefined, 'nafl').complete, false);
});

test('prayer parts are listed in performance order with rak‘ah counts', () => {
  const tuesday = new Date(2026, 10, 10);
  const friday = new Date(2026, 10, 13);
  const labels = (key, date, lang = 'en') => prayerParts(key).map(part => part.layer === 'fard' ? fardPartLabel(key, date, lang) : slotShortLabel(part.slot, date, lang));
  assert.deepEqual(labels('fajr', tuesday), ['2 Sunnah before', '2 Fard']);
  assert.deepEqual(labels('dhuhr', tuesday), ['4 Sunnah before', '4 Fard', '2 Sunnah after', '2 Nafl']);
  assert.deepEqual(prayerParts('dhuhr').map(part => part.layer), ['sunnah', 'fard', 'sunnah', 'nafl']);
  assert.deepEqual(labels('asr', tuesday), ['4 before (optional)', '4 Fard']);
  assert.deepEqual(labels('maghrib', tuesday), ['3 Fard', '2 Sunnah after', '2 Nafl']);
  assert.deepEqual(labels('isha', tuesday), ['4 before (optional)', '4 Fard', '2 Sunnah after', '2 Nafl']);
  assert.deepEqual(labels('dhuhr', friday), ['4 Sunnah before', '2 Jumu’ah / 4 Dhuhr', 'Sunnah after', '2 Nafl']);
  assert.deepEqual(labels('maghrib', tuesday, 'bn'), ['৩ ফরজ', 'পরে ২ রাকাত সুন্নাত', '২ নফল']);
  assert.ok(labels('dhuhr', friday, 'bn').every(label => !/[0-9]/.test(label)), 'Bengali digits in Bangla');
});

test('date-specific prayers move to the saffron ring; standalone ones stay striped, in time order', () => {
  assert.deepEqual([...SEASONAL_KEYS], ['tarawih', 'eid_prayer']);
  const at = h => new Date(2026, 2, 10, h);
  const events = [{ key: 'witr', start: at(20) }, { key: 'duha', start: at(7) }, { key: 'tarawih', start: at(20) }, { key: 'tahajjud', start: at(3) }];
  const { standalone, seasonal } = splitVoluntary(events);
  assert.deepEqual(standalone.map(event => event.key), ['tahajjud', 'duha', 'witr']);
  assert.deepEqual(seasonal.map(event => event.key), ['tarawih']);
});

test('UI wiring: parts gated by the prayer window, keyboard-accessible buttons, bilingual', () => {
  assert.doesNotMatch(app, /partsHtml\(prayer\.key, selectedDate/, 'Daily prayers cards no longer carry the sub-tick row');
  assert.match(app, /\$\{prayerNoteHtml\(prayer\.key\)\}/);
  assert.match(app, /partsHtml\(event\.key, event\.date, true, \{ includeFard: false \}\)/);
  assert.match(app, /item\.kind === 'fard' && item\.key === prayerKey && dateKey\(item\.date\) === dateText/);
  assert.match(app, /if \(!tick \|\| tick\.disabled\) return;/);
  assert.match(app, /if \(layer === 'fard'\) return togglePrayer\('fard', prayerKey, dateText\);/);
  assert.match(app, /<button type="button" class="part-tick/);
  assert.match(app, /aria-pressed="\$\{done\}"/);
  assert.doesNotMatch(app, /function partsNote/);
  assert.match(app, /'Date-specific':'বিশেষ দিনের নামাজ'/);
  assert.match(html, /legend-dot sunnah[\s\S]*legend-dot nafl[\s\S]*legend-dot voluntary[\s\S]*legend-dot seasonal/);
  assert.match(css, /\.part-tick\.fard i \{/);
});
