import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readText } from './helpers/read-text.js';

const css = readText('../src/styles.css', import.meta.url);
const config = JSON.parse(readText('../src-tauri/tauri.conf.json', import.meta.url));

test('UI scale responds smoothly to window width and height', () => {
  assert.match(css, /html\s*\{[^}]*font-size:\s*clamp\(14px,\s*calc\(12\.8px\s*\+\s*0\.32vw\s*\+\s*0\.18vh\),\s*28px\)/s);
  assert.match(css, /body\s*\{[^}]*font-size:\s*\.875rem/s);
});

test('component geometry uses scalable rem sizing', () => {
  assert.match(css, /\.app-shell\s*\{[^}]*container:\s*app-shell\s*\/\s*inline-size/s);
  assert.match(css, /\.app-shell\s*\{[^}]*width:\s*min\(3400px,\s*100%\)/s);
  assert.match(css, /\.next-card\s*\{[^}]*padding:\s*1\.6875rem/s);
  assert.match(css, /\.prayer-card\s*\{[^}]*padding:\s*0?\.9375rem/s);
});

test('wide and narrow windows have container-based layouts', () => {
  assert.match(css, /@container app-shell\s*\(min-width:\s*1450px\)/);
  assert.match(css, /@container app-shell\s*\(min-width:\s*1900px\)/);
  assert.match(css, /@container app-shell\s*\(max-width:\s*1100px\)/);
  assert.match(css, /@container app-shell\s*\(max-width:\s*780px\)/);
});

test('desktop window opens maximized and remains resizable at a practical minimum size', () => {
  const window = config.app.windows.find(item => item.label === 'main');
  assert.equal(window.maximized, true);
  assert.equal(window.resizable, true);
  assert.equal(window.minWidth, 640);
  assert.equal(window.minHeight, 480);
  assert.equal(window.width, 1280);
  assert.equal(window.height, 800);
});

test('4K desktop fullscreen keyboard controls are wired', () => {
  const app = readText('../src/app.js', import.meta.url);
  const keyboard = readText('../src/keyboard.js', import.meta.url);
  const capability = JSON.parse(readText('../src-tauri/capabilities/default.json', import.meta.url));
  assert.match(app, /getCurrentWindow/);
  assert.match(app, /shortcutFor\(event, \{ helpOpen: keyboardHelp\.open \}\)/);
  assert.match(keyboard, /key === 'F11'/);
  assert.match(keyboard, /key === 'Escape'/);
  for (const key of ['Home', 'PageUp', 'PageDown', 'End', '?']) assert.ok(keyboard.includes(`key === '${key}'`), `missing ${key} shortcut`);
  assert.match(app, /keyboardHelp\.showModal\(\)/);
  // core:default only grants read-only window commands; setFullscreen needs its own permission.
  assert.ok(capability.permissions.includes('core:window:allow-set-fullscreen'));
});
