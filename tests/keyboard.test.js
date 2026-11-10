import test from 'node:test';
import assert from 'node:assert/strict';
import { shortcutFor, isTypingTarget, pageScrollDistance, carouselArrowDelta } from '../src/keyboard.js';
import { readText } from './helpers/read-text.js';

const body = { tagName: 'BODY' };
const press = (key, extra = {}) => ({ key, target: body, ...extra });

test('F11, Escape, Home, End, Page Up, Page Down and ? map to their actions', () => {
  assert.equal(shortcutFor(press('F11')), 'fullscreen');
  assert.equal(shortcutFor(press('Escape')), 'escape');
  assert.equal(shortcutFor(press('Home')), 'home');
  assert.equal(shortcutFor(press('End')), 'end');
  assert.equal(shortcutFor(press('PageUp')), 'pageUp');
  assert.equal(shortcutFor(press('PageDown')), 'pageDown');
  assert.equal(shortcutFor(press('?', { shiftKey: true })), 'help');
  assert.equal(shortcutFor(press('/', { shiftKey: true })), 'help');
});

test('no other keys are hijacked', () => {
  for (const key of ['a', 'Enter', ' ', 'ArrowDown', 'ArrowLeft', 'Tab', '/', 'F5', 'Backspace']) {
    assert.equal(shortcutFor(press(key)), null, `${key} should not be a shortcut`);
  }
  assert.equal(shortcutFor(press('Home', { ctrlKey: true })), null);
  assert.equal(shortcutFor(press('End', { altKey: true })), null);
  assert.equal(shortcutFor(press('F11', { repeat: true })), null, 'held F11 must not flicker');
});

test('typing in inputs, textareas, selects and editable content is never interrupted', () => {
  for (const tagName of ['INPUT', 'TEXTAREA', 'SELECT']) {
    const target = { tagName };
    assert.equal(isTypingTarget(target), true);
    for (const key of ['Home', 'End', 'PageUp', 'PageDown', '?']) assert.equal(shortcutFor({ key, target, shiftKey: key === '?' }), null);
  }
  assert.equal(shortcutFor({ key: 'Home', target: { tagName: 'DIV', isContentEditable: true } }), null);
  // F11 and Escape still work everywhere (they never type a character).
  assert.equal(shortcutFor({ key: 'F11', target: { tagName: 'INPUT' } }), 'fullscreen');
  assert.equal(shortcutFor({ key: 'Escape', target: { tagName: 'INPUT' } }), 'escape');
  assert.equal(isTypingTarget({ tagName: 'BUTTON' }), false);
});

test('while the shortcut guide is open only ?, Escape and F11 act', () => {
  assert.equal(shortcutFor(press('PageDown'), { helpOpen: true }), null);
  assert.equal(shortcutFor(press('Home'), { helpOpen: true }), null);
  assert.equal(shortcutFor(press('?'), { helpOpen: true }), 'help');
  assert.equal(shortcutFor(press('Escape'), { helpOpen: true }), 'escape');
  assert.equal(shortcutFor(press('F11'), { helpOpen: true }), 'fullscreen');
});

test('page keys scroll by roughly one viewport', () => {
  assert.equal(pageScrollDistance(1000), 880);
  assert.equal(pageScrollDistance(2160), 1901);
  assert.equal(pageScrollDistance(100), 240);
});

test('Left and Right arrows page a focused carousel, other keys do not', () => {
  assert.equal(carouselArrowDelta(press('ArrowLeft')), -1);
  assert.equal(carouselArrowDelta(press('ArrowRight')), 1);
  assert.equal(carouselArrowDelta(press('ArrowUp')), 0);
  assert.equal(carouselArrowDelta(press('ArrowRight', { shiftKey: true })), 0);
  assert.equal(carouselArrowDelta({ key: 'ArrowLeft', target: { tagName: 'INPUT' } }), 0);
});

test('the shortcut guide lists every shortcut and is bilingual', async () => {
  const fs = await import('node:fs');
  const html = readText('../index.html', import.meta.url);
  const app = readText('../src/app.js', import.meta.url);
  const guide = html.slice(html.indexOf('id="keyboardHelp"'), html.indexOf('</dialog>'));
  for (const key of ['F11', 'Esc', 'Home', 'Page Up', 'Page Down', 'End', '?', '← →']) assert.ok(guide.includes(`<dt>${key}</dt>`), `guide is missing ${key}`);
  for (const [, text] of guide.matchAll(/<dd>([^<]+)<\/dd>/g)) assert.ok(app.includes(`'${text}':'`), `missing Bangla for "${text}"`);
  assert.ok(app.includes("'Keyboard shortcuts':'"));
  assert.ok(app.includes("'Close shortcuts':'"));
});
