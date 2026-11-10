import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeSections, SECTION_KEYS } from '../src/sections.js';
import { readText } from './helpers/read-text.js';

const html = readText('../index.html', import.meta.url);
const app = readText('../src/app.js', import.meta.url);
const css = readText('../src/styles.css', import.meta.url);

test('sections: all shown by default; only real booleans override; junk falls back to shown', () => {
  assert.deepEqual(SECTION_KEYS, ['descriptions', 'sunnah', 'onThisDay']);
  assert.deepEqual(sanitizeSections(undefined), { descriptions: true, sunnah: true, onThisDay: true });
  assert.deepEqual(sanitizeSections(null), { descriptions: true, sunnah: true, onThisDay: true });
  assert.deepEqual(sanitizeSections({ sunnah: false }), { descriptions: true, sunnah: false, onThisDay: true });
  assert.deepEqual(sanitizeSections({ descriptions: 'no', sunnah: 0, onThisDay: false, extra: 1 }), { descriptions: true, sunnah: true, onThisDay: false });
  const saved = JSON.parse(JSON.stringify({ sections: sanitizeSections({ onThisDay: false }) }));
  assert.deepEqual(sanitizeSections(saved.sections), { descriptions: true, sunnah: true, onThisDay: false }, 'round-trips through persistence');
});

test('settings toggles exist, are persisted and drive visibility; hidden sections are not rendered', () => {
  for (const id of ['showDescriptionsToggle', 'showSunnahToggle', 'showOnThisDayToggle']) {
    assert.match(html, new RegExp(`id="${id}"`));
    assert.ok(html.indexOf(`id="${id}"`) > html.indexOf('<main id="settingsView"'), `${id} lives in Settings`);
  }
  assert.match(app, /sections: \{ descriptions: true, sunnah: true, onThisDay: true \}/, 'default: all shown');
  assert.match(app, /sections: sanitizeSections\(saved\.sections\)/, 'persisted and validated on load');
  assert.match(app, /state\.sections\[key\] = event\.target\.checked;\n\s+save\(\);\n\s+applySectionVisibility\(\);/);
  assert.match(app, /state\.cards\[box\.dataset\.card\] = event\.target\.checked;\n\s+save\(\);\n\s+applySectionVisibility\(\);/, 'per-card toggles persist too');
  const fn = app.slice(app.indexOf('function applySectionVisibility'), app.indexOf('function renderPrayerGuidance'));
  assert.match(fn, /el\.hidden = !on;/);
  assert.match(fn, /if \(on\) render\(\); else clear\.forEach/, 'hidden: nothing rendered, content cleared');
  assert.match(fn, /if \(box\.hidden\) box\.textContent = ''; else render\(\);/, 'hidden cards are not rendered either');
  for (const [id, key] of [['prayerDetails', 'descriptions'], ['sunnahSection', 'sunnah'], ['onThisDaySection', 'onThisDay']]) {
    assert.match(fn, new RegExp(`set\\('${id}', '${key}',`));
    assert.match(html, new RegExp(`id="${id}"`));
  }
  const render = app.slice(app.indexOf('function render() {'), app.indexOf('function forbiddenCardHtml') > 0 ? app.indexOf('/* Forbidden-time card') : undefined);
  for (const call of ['renderPrayerGuidance', 'renderHijriPrayerEvent', 'renderPropheticDay', 'renderOnThisDay', 'renderQuranRevelation']) assert.doesNotMatch(render, new RegExp(`\\b${call}\\(\\)`), `render() does not call ${call} directly`);
  assert.match(render, /applySectionVisibility\(\);/);
  assert.match(css, /\.section-block\[hidden\] \{ display: none !important; \}/);
  assert.match(app, /if \(!state\.sections\.descriptions\) \{ showToast/, 'description links explain instead of scrolling to a hidden section');
});

test('settings toggles are bilingual', () => {
  for (const text of ['Sections on the home page', 'Show Prayer descriptions', 'Show Sunnah and Seerah', 'Show On this day in Islamic history', 'Send test notification']) {
    assert.ok(html.includes(text), `${text} is in the HTML`);
    assert.ok(app.includes(`'${text}':'`), `${text} has a Bangla translation`);
  }
});

test('Prayer descriptions stay ONE section whose categories are rows stacked vertically, sized to content', () => {
  assert.equal((html.match(/id="prayerDetails"/g) || []).length, 1);
  assert.equal((html.match(/id="descriptionList"/g) || []).length, 1);
  assert.match(css, /\.description-list \{ display: flex; flex-direction: column; gap: \.75rem;/);
  assert.doesNotMatch(css, /\.description-list \{ display: grid/, 'no horizontal layout at wide widths');
  assert.doesNotMatch(css, /\.description-list details/);
  const groups = (app.match(/\{ title: '(Obligatory prayers|Daily voluntary prayers|Situational voluntary prayers)'/g) || []).length;
  assert.equal(groups, 3, 'three categories');
  assert.match(app, /<section class="description-group"><h3>\$\{heading\}<\/h3><div class="ref-grid">/, 'evidence-first reference cards are kept');
});

import { CARD_KEYS, ALL_CARD_KEYS, sanitizeCards, tabVisible } from '../src/sections.js';
import { reminderRowVisible, isRamadan, isEidDay } from '../src/season.js';

test('v1.3.4 per-card toggles: defaults shown, sanitised, a tab with every card hidden disappears, markup matches the keys', () => {
  assert.equal(ALL_CARD_KEYS.length, 8);
  assert.ok(ALL_CARD_KEYS.every(key => sanitizeCards()[key] === true));
  assert.equal(sanitizeCards({ daily: false, bogus: false, hijriEvent: 'no' }).daily, false);
  assert.equal(sanitizeCards({ hijriEvent: 'no' }).hijriEvent, true);
  const sections = { descriptions: true, sunnah: true, onThisDay: false };
  assert.equal(tabVisible('sunnah', sections, sanitizeCards({ hijriEvent: false })), true);
  assert.equal(tabVisible('sunnah', sections, sanitizeCards({ hijriEvent: false, propheticDay: false })), false);
  assert.equal(tabVisible('onThisDay', sections, sanitizeCards()), false);
  for (const key of ALL_CARD_KEYS) assert.match(html, new RegExp(`data-card="${key}"`));
  assert.equal((html.match(/data-card="/g) || []).length, ALL_CARD_KEYS.length);
  for (const keys of Object.values(CARD_KEYS)) assert.ok(keys.length >= 2);
  assert.match(app, /cards: sanitizeCards\(saved\.cards\)/);
});

test('v1.3.4 reminder rows: Tarawih only in Ramadan, Eid prayer only on Eid days, everything else always; saved values untouched', () => {
  assert.ok(isRamadan({ month: 9, day: 12 }) && !isRamadan({ month: 8, day: 29 }) && !isRamadan(null));
  assert.ok(isEidDay({ month: 10, day: 1 }) && isEidDay({ month: 12, day: 10 }));
  assert.ok(!isEidDay({ month: 10, day: 2 }) && !isEidDay({ month: 12, day: 9 }));
  assert.equal(reminderRowVisible('tarawih', { month: 3, day: 1 }), false);
  assert.equal(reminderRowVisible('tarawih', { month: 9, day: 1 }), true);
  assert.equal(reminderRowVisible('eid_prayer', { month: 9, day: 1 }), false);
  assert.equal(reminderRowVisible('eid_prayer', { month: 10, day: 1 }), true);
  assert.equal(reminderRowVisible('fajr', { month: 3, day: 1 }), true);
  assert.match(app, /\.filter\(item => reminderRowVisible\(item\.key, hijriNow\)\)/);
  assert.doesNotMatch(app.slice(app.indexOf('function renderEventReminderSettings'), app.indexOf('function renderEventReminderSettings') + 1500), /delete state\.reminders/, 'hiding a row never deletes the saved choice');
});
