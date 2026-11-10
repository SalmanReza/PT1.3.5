import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normalizeText, readText } from './helpers/read-text.js';

/* The suite must give the same result on any OS, time zone, locale and day.
   v1.3.0 failed on the windows-2022 runner only: git checked the sources out
   with CRLF line endings and a source-level regex expected "\n". */

test('text reads are normalised to LF (CRLF and BOM safe)', () => {
  assert.equal(normalizeText('\uFEFFa\r\nb\rc\nd'), 'a\nb\nc\nd');
  assert.equal(normalizeText('x;\r\n    y'), 'x;\n    y');
});

test('no test reads project files without normalising line endings', () => {
  const dir = new URL('./', import.meta.url);
  for (const file of fs.readdirSync(dir).filter(name => name.endsWith('.test.js'))) {
    const source = readText(`./${file}`, import.meta.url);
    assert.doesNotMatch(source, /readFileSync\(new URL\([^)]*\), 'utf8'\)/, `${file} must use readText()`);
  }
});

test('tests never depend on the real current date or time', () => {
  const dir = new URL('./', import.meta.url);
  for (const file of fs.readdirSync(dir).filter(name => name.endsWith('.test.js') && name !== 'determinism.test.js')) {
    const lines = readText(`./${file}`, import.meta.url).split('\n');
    lines.forEach((line, index) => {
      if (/Date\.now\(\)/.test(line)) assert.fail(`${file}:${index + 1} uses Date.now()`);
      // new Date() with no arguments is allowed only where the value is irrelevant (input validation).
      if (/new Date\(\)/.test(line) && !/assert\.throws/.test(line)) assert.fail(`${file}:${index + 1} uses new Date() without a fixed date`);
    });
  }
});

// Optional: dot-files are often left out by GitHub's web upload. The suite
// does not need it (readText() normalises line endings), so skip if absent.
const hasGitattributes = fs.existsSync(new URL('../.gitattributes', import.meta.url));
test('.gitattributes keeps text files LF on every OS', { skip: !hasGitattributes && '.gitattributes not in this checkout' }, () => {
  const attributes = readText('../.gitattributes', import.meta.url);
  assert.match(attributes, /^\* text=auto eol=lf$/m);
  for (const ext of ['js', 'json', 'html', 'css', 'md', 'yml', 'rs', 'toml']) assert.match(attributes, new RegExp(`^\\*\\.${ext} text eol=lf$`, 'm'));
  assert.match(attributes, /^\*\.ps1 text eol=crlf$/m);
  assert.match(attributes, /^\*\.woff binary$/m);
});
