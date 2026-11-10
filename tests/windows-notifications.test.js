import test from 'node:test';
import assert from 'node:assert/strict';
import { readText } from './helpers/read-text.js';

const rust = readText('../src-tauri/src/main.rs', import.meta.url);
const cargo = readText('../src-tauri/Cargo.toml', import.meta.url);
const lock = readText('../src-tauri/Cargo.lock', import.meta.url);
const conf = JSON.parse(readText('../src-tauri/tauri.conf.json', import.meta.url));
const capability = JSON.parse(readText('../src-tauri/capabilities/default.json', import.meta.url));
const app = readText('../src/app.js', import.meta.url);
const html = readText('../index.html', import.meta.url);
const results = readText('../TEST-RESULTS.md', import.meta.url);

test('windows toast prerequisites: identifier is the AUMID, NSIS stays the installer, permissions allow the plugin flow', () => {
  assert.equal(conf.identifier, 'com.prayertimes.desktop');
  assert.deepEqual(conf.bundle.targets, ['nsis']);
  assert.ok(capability.permissions.includes('notification:default'));
  assert.ok(capability.permissions.includes('core:default'));
  assert.match(rust, /\.plugin\(tauri_plugin_notification::init\(\)\)/);
});

test('native toast command: own identity when the Start Menu shortcut exists, PowerShell identity otherwise, real errors returned', () => {
  assert.match(rust, /async fn notify_native\(app: tauri::AppHandle, title: String, body: String\) -> Result<String, String>/);
  assert.match(rust, /generate_handler!\[notify_native, notification_diagnostics, set_window_fullscreen\]/);
  assert.match(rust, /fn start_menu_shortcut\(product: &str\)/);
  for (const piece of ['"APPDATA"', '"ProgramData"', '"Start Menu"', '"Programs"']) assert.ok(rust.includes(piece), piece);
  assert.match(rust, /if let Some\(id\) = &app_id \{\n\s+toast\.app_id\(id\);/);
  assert.match(rust, /\.map_err\(\|error\| format!\("Windows could not show the notification: \{error\}"\)\)\?/);
  assert.match(rust, /#\[cfg\(not\(windows\)\)\]/, 'non-Windows builds keep using the plugin');
  assert.match(cargo, /\[target\.'cfg\(windows\)'\.dependencies\]\nnotify-rust = "4"/);
  assert.match(lock, /name = "prayer-times-desktop"\nversion = "[\d.]+"\ndependencies = \[\n "notify-rust",/, 'Cargo.lock lists the new dependency (builds with --locked)');
  assert.match(lock, /name = "notify-rust"\nversion = "4\./);
});

test('page: native command first, plugin fallback, reminders retried when a send fails, test button shows the reason', () => {
  assert.match(app, /await invoke\('notify_native', \{ title, body \}\)/);
  assert.match(app, /\/not found\|unknown command\|not allowed\/i/);
  assert.match(app, /async function sendTestNotification\(\)/);
  assert.match(app, /invoke\('notification_diagnostics'\)/);
  assert.match(app, /\$\('testNotification'\)\.addEventListener\('click', \(\) => \{ sendTestNotification\(\); \}\);/);
  assert.match(html, /id="testNotification"/);
  assert.match(html, /id="notificationStatus"[^>]*role="status"/);
  assert.match(app, /Focus assist/, 'the failure hint names Focus assist');
});

test('TEST-RESULTS documents the root cause, what is verified versus assumed, and the manual checklist', () => {
  assert.match(results, /Windows 10 notifications/);
  assert.match(results, /Verified/);
  assert.match(results, /Assumed/);
  assert.match(results, /Manual test checklist/);
});
