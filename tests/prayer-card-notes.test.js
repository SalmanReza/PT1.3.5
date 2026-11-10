import test from 'node:test';
import assert from 'node:assert/strict';
import { SUNNI_CARD_NOTES, JAFARI_CARD_NOTES, cardNote } from '../src/prayer-card-notes.js';
import { readText } from './helpers/read-text.js';

const FARD = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

test('each set has five cards, bilingual, short, Bengali digits only, and every note is referenced', () => {
  for (const set of [SUNNI_CARD_NOTES, JAFARI_CARD_NOTES]) {
    assert.deepEqual(Object.keys(set), FARD);
    for (const [key, note] of Object.entries(set)) {
      assert.ok(note.en.length <= 80, `${key} EN ${note.en.length}`);
      assert.ok(note.bn.length <= 90, `${key} BN ${note.bn.length}`);
      assert.match(note.bn, /[\u0980-\u09FF]/);
      assert.doesNotMatch(note.bn, /[0-9]/, 'Bengali digits only');
      assert.ok(note.ref || (note.src && note.srcBn), `${key} has a reference`);
      for (const lang of ['en', 'bn']) assert.ok(cardNote(key, lang, 'hanafi').ref.length > 3);
    }
  }
});

test('the four Sunni schools show identical notes; Ja‘fari switches to its own set', () => {
  for (const key of FARD) {
    const hanafi = cardNote(key, 'en', 'hanafi');
    for (const school of ['shafii', 'maliki', 'hanbali']) assert.deepEqual(cardNote(key, 'en', school), hanafi);
    for (const school of ['hanafi', 'hanbali']) assert.deepEqual(cardNote(key, 'bn', school), cardNote(key, 'bn', 'maliki'));
  }
  assert.equal(cardNote('fajr', 'en', 'hanafi').ref, 'Sahih Muslim 725');
  assert.equal(cardNote('fajr', 'en', 'jafari').ref, 'Qur’an 17:78');
  assert.match(cardNote('isha', 'en', 'jafari').ref, /al-Kāfi/);
  assert.match(cardNote('isha', 'bn', 'jafari').ref, /আল-কাফি.*৪/);
  assert.equal(cardNote('sunrise'), null);
  const sunni = JSON.stringify(SUNNI_CARD_NOTES), jafari = JSON.stringify(JAFARI_CARD_NOTES);
  assert.doesNotMatch(sunni, /Kāfi|Kafi/);
  assert.doesNotMatch(jafari, /Bukhari|Muslim/);
});

test('no school name, ruling or contested tafsir in a card note', () => {
  for (const set of [SUNNI_CARD_NOTES, JAFARI_CARD_NOTES]) for (const note of Object.values(set)) {
    assert.doesNotMatch(`${note.en} ${note.bn}`, /Hanafi|Shafi|Maliki|Hanbali|Ja.?fari|Sunnah|Fard|middle|wusta|Asr is|হানাফি|মধ্যবর্তী/i);
  }
});

test('the card shows the note instead of the sub-tick row; ticking stays on the live card', () => {
  const app = readText('../src/app.js', import.meta.url);
  const css = readText('../src/styles.css', import.meta.url);
  assert.match(app, /function prayerNoteHtml\(prayerKey\)/);
  assert.match(app, /cardNote\(prayerKey, lang\(\), shiaMode\(\) \? 'jafari' : state\.profile\.school\)/);
  assert.doesNotMatch(app, /partsHtml\(prayer\.key/);
  assert.match(app, /partsHtml\(event\.key, event\.date, true, \{ includeFard: false \}\)/, 'Sunnah/Nafl ticks live on the open prayer card');
  assert.match(css, /\.prayer-note \{[^}]*overflow-wrap: anywhere/);
});
