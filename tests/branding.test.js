import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { copyrightText, APP_VERSION, COPYRIGHT } from '../src/branding.js';
import { readText } from './helpers/read-text.js';

const read = path => readText(path, import.meta.url);

test('footer copyright switches between English and Bangla', () => {
  assert.equal(copyrightText('en'), '© 2026–2027 Salman Reza Amit');
  assert.equal(copyrightText('bn'), '© ২০২৬–২০২৭ সালমান রেজা অমিত');
  assert.equal(copyrightText(undefined), COPYRIGHT.en);
  assert.doesNotMatch(copyrightText('bn'), /[0-9]/, 'Bangla uses Bengali numerals');
});

test('copyright sits fixed in the bottom-left corner in tiny lettering', () => {
  const css = read('../src/styles.css');
  const rule = /\.copyright-corner \{([^}]*)\}/.exec(css)?.[1] || '';
  assert.match(rule, /position:fixed/);
  assert.match(rule, /left:/);
  assert.match(rule, /bottom:/);
  assert.match(rule, /font-size:\.4\d?rem/);
  assert.match(rule, /pointer-events:none/);
});

test('version 1.3.5 and author metadata are consistent across the project', () => {
  const pkg = JSON.parse(read('../package.json'));
  const tauri = JSON.parse(read('../src-tauri/tauri.conf.json'));
  const cargo = read('../src-tauri/Cargo.toml');
  assert.equal(APP_VERSION, '1.3.5');
  assert.equal(pkg.version, APP_VERSION);
  assert.equal(tauri.version, APP_VERSION);
  assert.match(cargo, /^version = "1\.3\.5"$/m);
  assert.equal(pkg.author, 'Salman Reza Amit');
  assert.match(cargo, /^authors = \["Salman Reza Amit"\]$/m);
  assert.equal(tauri.bundle.publisher, 'Salman Reza Amit');
  assert.equal(tauri.bundle.copyright, '© 2026–2027 Salman Reza Amit');
  assert.match(read('../README.md'), /^# Prayer Times — Windows desktop application \(v1\.3\.5\)/);
  assert.match(read('../CHANGELOG.txt'), /^Prayer Times Desktop v1\.3\.5/);
});

test('Authenticode signing is optional and skips cleanly without a certificate', () => {
  const script = read('../scripts/Sign-Windows.ps1');
  const build = read('../BUILD-WINDOWS.ps1');
  const workflow = read('../.github/workflows/build-windows.yml');
  assert.match(script, /WINDOWS_CERTIFICATE_PATH/);
  assert.match(script, /WINDOWS_CERTIFICATE_PASSWORD/);
  assert.match(script, /Code signing skipped: no certificate provided/);
  assert.match(script, /'sign', '\/fd', 'SHA256'/);
  assert.match(script, /Remove-Item -LiteralPath \$temporaryPfx/);
  assert.match(build, /Sign-Windows\.ps1/);
  assert.match(build, /& \$SignScript -Path \$Executable/);
  assert.match(build, /& \$SignScript -Path \$Installer\.FullName/);
  assert.match(workflow, /WINDOWS_CERTIFICATE: \$\{\{ secrets\.WINDOWS_CERTIFICATE \}\}/);
  assert.match(workflow, /Sign-Windows\.ps1 -Path \.\/src-tauri\/target\/release\/prayer-times-desktop\.exe/);
  const files = fs.readdirSync(new URL('..', import.meta.url), { recursive: true }).map(String);
  assert.ok(!files.some(file => /\.(pfx|p12|cer|pem|key)$/i.test(file) && !file.includes('node_modules')), 'no certificate is committed');
});
