import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { UI_FONTS, DEFAULT_UI_FONT, SYSTEM_STACK, sanitizeUiFont, uiFontStack, uiFontLabel } from '../src/ui-fonts.js';
import { readText } from './helpers/read-text.js';

const css = readText('../src/styles.css', import.meta.url);
const app = readText('../src/app.js', import.meta.url);
const html = readText('../index.html', import.meta.url);

test('ten font options, unique ids, bilingual labels, default is the unchanged system look', () => {
  assert.equal(UI_FONTS.length, 10);
  assert.equal(new Set(UI_FONTS.map(f => f.id)).size, 10);
  assert.equal(DEFAULT_UI_FONT, 'system');
  assert.equal(UI_FONTS[0].id, 'system');
  assert.equal(SYSTEM_STACK, '"Segoe UI Variable", "Segoe UI", "Nirmala UI", "Amiri", system-ui, sans-serif');
  assert.equal(uiFontStack('system'), SYSTEM_STACK);
  for (const f of UI_FONTS) {
    assert.ok(f.en && f.bn, f.id);
    assert.match(f.bn, /[\u0980-\u09FF]/, `Bangla label for ${f.id}`);
    assert.equal(uiFontLabel(f.id, 'en'), f.en);
    assert.equal(uiFontLabel(f.id, 'bn'), f.bn);
  }
  assert.ok(css.includes(`--ui-font: ${SYSTEM_STACK};`), 'CSS default equals the v1.3.0 stack');
});

test('every option is sanitized; invalid and old saved values fall back to the default', () => {
  for (const f of UI_FONTS) assert.equal(sanitizeUiFont(f.id), f.id);
  for (const bad of [undefined, null, '', 'Comic Sans', 'HIND', 7, {}, [], 'system '] ) assert.equal(sanitizeUiFont(bad), 'system');
  assert.match(app, /uiFont: sanitizeUiFont\(saved\.uiFont\)/, 'settings saved by older versions have no uiFont and load as default');
  assert.match(app, /uiFont: DEFAULT_UI_FONT/);
  assert.match(app, /\$\('uiFontSelect'\)\.addEventListener\('change', event => \{ state\.uiFont = sanitizeUiFont\(event\.target\.value\); save\(\); applyUiFont\(\); \}\);/);
  assert.match(html, /<label for="uiFontSelect">Font<\/label><select id="uiFontSelect"><\/select>/);
  assert.match(app, /'Font':'ফন্ট'/);
});

test('each bundled font has a local WOFF2 file, an @font-face rule and an OFL text; nothing is remote', () => {
  const families = UI_FONTS.filter(f => f.family).map(f => f.family);
  assert.equal(families.length, 9);
  let total = 0;
  for (const family of families) {
    assert.match(uiFontStack(UI_FONTS.find(f => f.family === family).id), new RegExp(`^"${family}", `));
    const rules = [...css.matchAll(new RegExp(`@font-face \\{ font-family: "${family}"; src: url\\("\\./fonts/ui/([a-z0-9-]+\\.woff2)"\\)`, 'g'))];
    assert.ok(rules.length >= 1, `@font-face for ${family}`);
    for (const [, file] of rules) {
      const bytes = fs.statSync(new URL(`../src/fonts/ui/${file}`, import.meta.url)).size;
      assert.ok(bytes > 20000 && bytes < 250000, `${file} ${bytes}`);
      total += bytes;
    }
  }
  assert.ok(total < 1_500_000, `bundled UI fonts are ${total} bytes`);
  const licences = fs.readdirSync(new URL('../src/fonts/ui/', import.meta.url)).filter(n => n.startsWith('OFL-'));
  assert.equal(licences.length, 9);
  for (const n of licences) assert.match(readText(`../src/fonts/ui/${n}`, import.meta.url), /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.doesNotMatch(css, /@import|url\(["']?https?:/);
});

test('the font applies app-wide through one CSS variable; the reward keeps Aref Ruqaa', () => {
  assert.doesNotMatch(css.replace(/--ui-font:[^;]*;/, ''), /"Segoe UI Variable"/, 'no hard-coded UI stacks left');
  assert.match(css, /font-family: var\(--ui-font\);/);
  assert.match(css, /\.pf-reward \{[^}]*font-family: "Alhamdulillah Ruqaa", "Aref Ruqaa"/);
  assert.match(app, /document\.documentElement\.style\.setProperty\('--ui-font', uiFontStack\(state\.uiFont\)\)/);
  assert.match(app, /function applyTheme\(\) \{\n  applyUiFont\(\);/);
});
