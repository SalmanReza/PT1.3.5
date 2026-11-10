import test from 'node:test';
import assert from 'node:assert/strict';
import { SUNNI_EVIDENCE, JAFARI_EVIDENCE, JAFARI_HIDDEN, evidenceFor, evidenceSet } from '../src/prayer-evidence.js';
import { PRAYER_GUIDANCE } from '../src/islamic-content.js';
import { readText } from './helpers/read-text.js';

const SUNNI = ['hanafi', 'shafii', 'maliki', 'hanbali'];

test('every guidance entry has evidence in both sets (Ja‘fari omits only the prayers it does not schedule)', () => {
  for (const key of Object.keys(PRAYER_GUIDANCE)) {
    assert.ok(SUNNI_EVIDENCE[key], `Sunni ${key}`);
    if (!JAFARI_HIDDEN.includes(key)) assert.ok(JAFARI_EVIDENCE[key], `Ja‘fari ${key}`);
  }
  for (const key of JAFARI_HIDDEN) assert.equal(JAFARI_EVIDENCE[key], undefined);
});

test('every entry is referenced, bilingual, and uses Bengali digits in Bangla', () => {
  for (const [name, set] of [['sunni', SUNNI_EVIDENCE], ['jafari', JAFARI_EVIDENCE]]) {
    for (const [key, items] of Object.entries(set)) {
      assert.ok(items.length >= 1 && items.length <= 2, `${name} ${key}`);
      for (const item of items) {
        assert.ok(item.en.length > 10 && item.en.length <= 190, `${name} ${key} EN ${item.en.length}`);
        assert.ok(item.bn.length > 10 && item.bn.length <= 230, `${name} ${key} BN ${item.bn.length}`);
        assert.match(item.bn, /[\u0980-\u09FF]/);
        assert.doesNotMatch(item.bn, /[0-9]/);
        if (item.kind === 'quran') assert.match(item.ref, /^Q\d+:\d+(-\d+)?$/);
        else { assert.ok(item.src && item.srcBn, `${name} ${key} hadith source`); assert.doesNotMatch(item.srcBn, /[0-9]/); }
      }
      for (const lang of ['en', 'bn']) for (const e of evidenceFor(key, name === 'jafari' ? 'jafari' : 'hanafi', lang).items) assert.ok(e.ref.length > 4);
    }
  }
});

test('the four Sunni schools produce identical text; switching to Ja‘fari switches the set', () => {
  for (const key of Object.keys(SUNNI_EVIDENCE)) for (const lang of ['en', 'bn']) {
    const base = evidenceFor(key, 'hanafi', lang);
    for (const school of SUNNI.slice(1)) assert.deepEqual(evidenceFor(key, school, lang), base);
  }
  assert.equal(evidenceSet('jafari'), 'jafari');
  for (const s of SUNNI) assert.equal(evidenceSet(s), 'sunni');
  assert.notDeepEqual(evidenceFor('fajr', 'hanafi', 'en'), evidenceFor('fajr', 'jafari', 'en'));
  assert.match(JSON.stringify(evidenceFor('fajr', 'hanafi', 'en')), /Sahih Muslim 725/);
  assert.match(JSON.stringify(evidenceFor('fajr', 'jafari', 'en')), /al-Kāfi/);
});

test('Sunni set cites only Qur’an, Bukhari, Muslim and the Sunan; Ja‘fari only Qur’an and al-Kāfi', () => {
  const sunniSrc = Object.values(SUNNI_EVIDENCE).flat().filter(i => i.kind === 'hadith').map(i => i.src);
  const jafariSrc = Object.values(JAFARI_EVIDENCE).flat().filter(i => i.kind === 'hadith').map(i => i.src);
  assert.ok(sunniSrc.length >= 14 && jafariSrc.length >= 5);
  for (const s of sunniSrc) assert.match(s, /^(Sahih al-Bukhari|Sahih Muslim|Sunan Abi Dawud)/);
  for (const s of jafariSrc) assert.match(s, /^al-Kāfi, Book of Prayer, “Those Who Preserve Salah and Those Who Lose”, no\. \d+ \(/);
  assert.doesNotMatch(JSON.stringify(JAFARI_EVIDENCE), /Bukhari|Muslim/);
  assert.doesNotMatch(JSON.stringify(SUNNI_EVIDENCE), /Kāfi/);
});

test('known references are not mixed up (spot checks)', () => {
  assert.match(JSON.stringify(SUNNI_EVIDENCE.istikhara), /Sahih al-Bukhari 6382/);
  assert.match(JSON.stringify(SUNNI_EVIDENCE.jumuah), /Sahih Muslim 854/);
  assert.match(JSON.stringify(SUNNI_EVIDENCE.tahiyyatul_masjid), /Bukhari 444.*Muslim 714/);
});

test('the reference section renders cards: quote first, practical guidance below, Ja‘fari hides what it does not schedule', () => {
  const app = readText('../src/app.js', import.meta.url);
  const css = readText('../src/styles.css', import.meta.url);
  assert.match(app, /function referenceCardHtml\(key, titleText\)/);
  assert.match(app, /evidenceFor\(jumuah \? 'jumuah' : key, school/);
  assert.match(app, /shiaMode\(\) \? 'jafari' : state\.profile\.school/);
  assert.match(app, /JAFARI_HIDDEN/);
  assert.ok(app.indexOf('class="ref-title"') < app.indexOf('${quotes}') && app.indexOf('${quotes}') < app.indexOf('${below}'));
  assert.doesNotMatch(app, /<details id="description-/);
  for (const sel of ['.ref-card', '.ref-quote', '.ref-quote blockquote', '.ref-quote figcaption', '.ref-practical']) assert.ok(css.includes(sel), sel);
  assert.match(css, /\.ref-card \{[^}]*overflow-wrap:anywhere/);
  assert.match(css, /\.ref-grid \{[^}]*minmax\(min\(100%, 17rem\), 1fr\)/);
});
